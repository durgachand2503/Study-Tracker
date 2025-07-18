const express = require('express');
const {
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/:channelId/messages', getMessages);
router.post('/:channelId/messages', sendMessage);
router.delete('/messages/:messageId', deleteMessage);
router.put('/messages/:messageId', editMessage);

module.exports = router;