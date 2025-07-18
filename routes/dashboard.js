const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getTaskSummary } = require('../controllers/taskController');

const router = express.Router();
router.use(authenticateToken);
router.get('/tasks', (req, res, next) => {
  console.log('🔔 /dashboard/tasks route hit');
  next();
}, getTaskSummary);

module.exports = router;