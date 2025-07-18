const express = require('express');
const {
  startSession,
  stopSession,
  getSessionHistory,
  getActiveSession
} = require('../controllers/sessionController');

const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/start', startSession);
router.put('/stop/:sessionId', stopSession);
router.get('/history', getSessionHistory);
router.get('/active', getActiveSession);

module.exports = router;