import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { validateTeamLogin, validateAdminLogin } from '../middleware/validation.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Team Login
router.post('/team/login', loginLimiter, validateTeamLogin, async (req, res) => {
  try {
    const { team_id, password } = req.body;

    // Fetch team from database
    const result = await pool.query(
      'SELECT * FROM teams WHERE team_id = $1',
      [team_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid team ID or password' });
    }

    const team = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, team.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid team ID or password' });
    }

    // Generate JWT token
    const token = generateToken({
      id: team.id,
      team_id: team.team_id,
      team_name: team.team_name,
      role: 'team'
    });

    res.json({
      message: 'Login successful',
      token,
      team: {
        id: team.id,
        team_id: team.team_id,
        team_name: team.team_name
      }
    });

  } catch (error) {
    console.error('Team login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Login
router.post('/admin/login', loginLimiter, validateAdminLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple admin check (in production, store this in database)
    if (username !== process.env.ADMIN_USERNAME || 
        password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      username,
      role: 'admin'
    });

    res.json({
      message: 'Admin login successful',
      token,
      admin: { username }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const user = jwt.default.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user });
  } catch (error) {
    res.status(403).json({ valid: false });
  }
});

export default router;
