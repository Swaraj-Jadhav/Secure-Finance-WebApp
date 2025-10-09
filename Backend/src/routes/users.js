const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder for user-specific routes
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'User dashboard data',
    data: {
      user: req.user,
      timestamp: new Date()
    }
  });
});

module.exports = router;
