import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Fisher-Yates (Knuth) shuffle — unbiased
function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Assign random questions to team (called on first access)
async function assignQuestionsToTeam(teamId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Advisory lock to prevent race conditions (hash teamId to integer)
    const lockKey = Math.abs(teamId.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0));
    await client.query('SELECT pg_advisory_xact_lock($1)', [lockKey]);

    // Check if questions already assigned (safe under advisory lock)
    const existingCheck = await client.query(
      'SELECT COUNT(*) FROM team_questions WHERE team_id = $1',
      [teamId]
    );

    if (parseInt(existingCheck.rows[0].count) > 0) {
      await client.query('COMMIT');
      return; // Questions already assigned
    }

    // Fetch ALL 50 questions from database
    const questionsResult = await client.query('SELECT id FROM questions');
    let allQuestions = questionsResult.rows.map(row => ({ question_id: row.id }));

    // Shuffle with Fisher-Yates (unbiased) — each team gets a unique order
    allQuestions = fisherYatesShuffle(allQuestions);

    // Parameterized batch INSERT for all 50 questions
    const params = [];
    const valuePlaceholders = allQuestions.map((q, i) => {
      const offset = i * 3;
      params.push(teamId, q.question_id, i + 1);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
    }).join(', ');

    await client.query(
      `INSERT INTO team_questions (team_id, question_id, question_order)
       VALUES ${valuePlaceholders}`,
      params
    );

    // Record quiz start time (server-side timer)
    await client.query(
      'UPDATE teams SET quiz_started_at = CURRENT_TIMESTAMP WHERE id = $1',
      [teamId]
    );

    await client.query('COMMIT');
    console.log(`✅ Assigned ${allQuestions.length} questions to team ${teamId}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning questions:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get questions for logged-in team
router.get('/', authenticateToken, async (req, res) => {
  try {
    const teamId = req.user.id;

    // Ensure questions are assigned
    await assignQuestionsToTeam(teamId);

    // Get server-side timer info
    const teamInfo = await pool.query(
      'SELECT quiz_started_at FROM teams WHERE id = $1',
      [teamId]
    );
    const quizStartedAt = teamInfo.rows[0]?.quiz_started_at;
    const QUIZ_DURATION = 60 * 60; // 60 minutes in seconds
    let serverTimeRemaining = QUIZ_DURATION;

    if (quizStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(quizStartedAt).getTime()) / 1000);
      serverTimeRemaining = Math.max(0, QUIZ_DURATION - elapsed);
    }

    // Fetch assigned questions with their order
    const result = await pool.query(
      `SELECT 
        q.id,
        q.category,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        tq.question_order,
        ta.selected_answer
       FROM team_questions tq
       JOIN questions q ON tq.question_id = q.id
       LEFT JOIN team_attempts ta ON ta.team_id = tq.team_id AND ta.question_id = q.id
       WHERE tq.team_id = $1
       ORDER BY tq.question_order`,
      [teamId]
    );

    // Don't send correct answers to frontend
    const questions = result.rows.map(q => ({
      id: q.id,
      category: q.category,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      question_order: q.question_order,
      selected_answer: q.selected_answer || null
    }));

    res.json({
      questions,
      total: questions.length,
      serverTimeRemaining,
      quizStartedAt
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get specific question by order number
router.get('/:order', authenticateToken, async (req, res) => {
  try {
    const teamId = req.user.id;
    const order = parseInt(req.params.order);

    if (isNaN(order) || order < 1 || order > 50) {
      return res.status(400).json({ error: 'Invalid question number' });
    }

    const result = await pool.query(
      `SELECT 
        q.id,
        q.category,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        tq.question_order,
        ta.selected_answer
       FROM team_questions tq
       JOIN questions q ON tq.question_id = q.id
       LEFT JOIN team_attempts ta ON ta.team_id = tq.team_id AND ta.question_id = q.id
       WHERE tq.team_id = $1 AND tq.question_order = $2`,
      [teamId, order]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const q = result.rows[0];
    const question = {
      id: q.id,
      category: q.category,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      question_order: q.question_order,
      selected_answer: q.selected_answer || null
    };

    res.json(question);

  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

export default router;
