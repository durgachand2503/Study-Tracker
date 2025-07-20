const express = require('express');
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/channelController');

const router = express.Router();

// Public
router.get('/', ctrl.getChannels);

// Protected (mentor/student)
router.post('/', auth, ctrl.createChannel);
router.get('/:id', auth, ctrl.getChannelById);
router.post('/:id/join', auth, ctrl.joinChannel);
router.post('/:id/videos', auth, ctrl.addVideo);
router.delete('/:id/videos/:videoId', auth, ctrl.deleteVideo);

module.exports = router;
