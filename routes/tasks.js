const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskSummary
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.get('/summary/stats', getTaskSummary); 

module.exports = router;