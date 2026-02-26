export const validateTeamLogin = (req, res, next) => {
  const { team_id, password } = req.body;

  if (!team_id || !password) {
    return res.status(400).json({ 
      error: 'Team ID and password are required' 
    });
  }

  if (typeof team_id !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid input format' 
    });
  }

  if (team_id.length > 50 || password.length > 100) {
    return res.status(400).json({ 
      error: 'Input length exceeds maximum allowed' 
    });
  }

  next();
};

export const validateAdminLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username and password are required' 
    });
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid input format' 
    });
  }

  next();
};

export const validateAnswer = (req, res, next) => {
  const { question_id, selected_answer } = req.body;

  if (!question_id) {
    return res.status(400).json({ 
      error: 'Question ID is required' 
    });
  }

  if (!selected_answer || !['A', 'B', 'C', 'D'].includes(selected_answer)) {
    return res.status(400).json({ 
      error: 'Invalid answer option. Must be A, B, C, or D' 
    });
  }

  next();
};
