import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAnswer } from '../middleware/validation.js';

const router = express.Router();

const QUIZ_DURATION = 60 * 60; // 60 minutes in seconds
const GRACE_PERIOD = 30; // 30 seconds grace for network latency

// Helper: check if quiz time has expired server-side
async function checkQuizTimeExpired(teamId) {
  const result = await pool.query(
    'SELECT quiz_started_at FROM teams WHERE id = $1',
    [teamId]
  );
  const startedAt = result.rows[0]?.quiz_started_at;
  if (!startedAt) return false; // quiz hasn't started
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return elapsed > (QUIZ_DURATION + GRACE_PERIOD);
}

// Helper: calculate server-side time taken
async function calculateTimeTaken(teamId) {
  const result = await pool.query(
    'SELECT quiz_started_at FROM teams WHERE id = $1',
    [teamId]
  );
  const startedAt = result.rows[0]?.quiz_started_at;
  if (!startedAt) return null;
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
}

// Save/Update answer for a question
router.post('/answer', authenticateToken, validateAnswer, async (req, res) => {
  try {
    const teamId = req.user.id;
    const { question_id, selected_answer } = req.body;

    // Server-side time check — reject if quiz expired
    const expired = await checkQuizTimeExpired(teamId);
    if (expired) {
      return res.status(403).json({ error: 'Quiz time has expired. You can no longer save answers.' });
    }

    // Verify this question is assigned to this team
    const assignedCheck = await pool.query(
      'SELECT id FROM team_questions WHERE team_id = $1 AND question_id = $2',
      [teamId, question_id]
    );

    if (assignedCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Question not assigned to your team' });
    }

    // Check if already submitted
    const submissionCheck = await pool.query(
      'SELECT id FROM results WHERE team_id = $1',
      [teamId]
    );

    if (submissionCheck.rows.length > 0) {
      return res.status(403).json({ error: 'Quiz already submitted' });
    }

    // Get correct answer
    const questionResult = await pool.query(
      'SELECT correct_answer FROM questions WHERE id = $1',
      [question_id]
    );

    const correctAnswer = questionResult.rows[0].correct_answer;
    const isCorrect = selected_answer === correctAnswer;

    // Insert or update attempt
    await pool.query(
      `INSERT INTO team_attempts (team_id, question_id, selected_answer, is_correct)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (team_id, question_id)
       DO UPDATE SET 
         selected_answer = EXCLUDED.selected_answer,
         is_correct = EXCLUDED.is_correct,
         timestamp = CURRENT_TIMESTAMP`,
      [teamId, question_id, selected_answer, isCorrect]
    );

    res.json({
      message: 'Answer saved successfully',
      saved: true
    });

  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// Submit final quiz
router.post('/submit', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const teamId = req.user.id;

    // Server-side time calculation (ignore client-provided time_taken)
    const timeTaken = await calculateTimeTaken(teamId);

    await client.query('BEGIN');

    // Calculate score
    const scoreResult = await client.query(
      `SELECT COUNT(*) as correct_count
       FROM team_attempts
       WHERE team_id = $1 AND is_correct = true`,
      [teamId]
    );

    const totalScore = parseInt(scoreResult.rows[0].correct_count);

    // Race-safe insert: ON CONFLICT returns nothing, so we know if it was a duplicate
    const insertResult = await client.query(
      `INSERT INTO results (team_id, total_score, total_questions, time_taken)
       VALUES ($1, $2, 50, $3)
       ON CONFLICT (team_id) DO NOTHING
       RETURNING id`,
      [teamId, totalScore, timeTaken]
    );

    if (insertResult.rows.length === 0) {
      // Row already existed — duplicate submission
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Quiz already submitted' });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Quiz submitted successfully',
      score: totalScore,
      total: 50
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  } finally {
    client.release();
  }
});

// Get submission status and score (if submitted)
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const teamId = req.user.id;

    const result = await pool.query(
      `SELECT 
        r.total_score,
        r.total_questions,
        r.time_taken,
        r.submitted_at,
        (SELECT COUNT(*) FROM team_attempts WHERE team_id = $1) as answered_count
       FROM results r
       WHERE r.team_id = $1`,
      [teamId]
    );

    if (result.rows.length === 0) {
      // Not yet submitted
      const answeredResult = await pool.query(
        'SELECT COUNT(*) FROM team_attempts WHERE team_id = $1',
        [teamId]
      );

      return res.json({
        submitted: false,
        answered_count: parseInt(answeredResult.rows[0].count)
      });
    }

    const data = result.rows[0];
    res.json({
      submitted: true,
      score: data.total_score,
      total: data.total_questions,
      time_taken: data.time_taken,
      submitted_at: data.submitted_at,
      answered_count: parseInt(data.answered_count)
    });

  } catch (error) {
    console.error('Error fetching submission status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
