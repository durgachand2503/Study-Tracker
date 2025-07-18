const mongoose = require('mongoose');
const Message = require('../models/Message');

// 📥 Get messages by channel with pagination
const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ channelId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name avatar');

    const total = await Message.countDocuments({ channelId });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Oldest first
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMessages: total
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// ✉️ Send a new message
const sendMessage = async (req, res) => {
  console.log('🔔 sendMessage route triggered');
  try {
    const { channelId } = req.params;
    const { message } = req.body;

    console.log('Incoming message:', message);

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message must be a non-empty string'
      });
    }

    const newMessage = new Message({
      channelId,
      userId: req.user._id,
      username: req.user.name,
      message: message.trim(),
      timestamp: new Date()
    });

    await newMessage.save();
    console.log('Saved message:', newMessage);

    const io = req.app.get('io');
    io.to(channelId).emit('new-message', {
      _id: newMessage._id,
      channelId,
      message: newMessage.message,
      userId: newMessage.userId,
      username: newMessage.username,
      timestamp: newMessage.timestamp
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// 🗑️ Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // ✅ Validate messageId format
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    // ✅ Fetch the message
    const message = await Message.findById(messageId);

    // ✅ Check existence and ownership
    if (!message || !message.userId.equals(req.user._id)) {
      console.log('Requesting user:', req.user._id);
      console.log('Target message ID:', messageId);
      console.log('Message owner:', message?.userId?.toString());
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    // ✅ Delete the message
    await Message.findByIdAndDelete(messageId);

    // ✅ Emit deletion event via Socket.io
    const io = req.app.get('io');
    io.to(message.channelId).emit('message-deleted', {
      messageId,
      channelId: message.channelId
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// ✏️ Edit a message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // ✅ Validate messageId format
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    // ✅ Fetch and verify ownership
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage || !originalMessage.userId.equals(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    // ✅ Update the message
    originalMessage.message = message.trim();
    originalMessage.edited = true;
    originalMessage.editedAt = new Date();
    await originalMessage.save();

    // ✅ Emit edit event via Socket.io
    const io = req.app.get('io');
    io.to(originalMessage.channelId).emit('message-edited', {
      messageId,
      channelId: originalMessage.channelId,
      message: originalMessage.message,
      edited: true,
      editedAt: originalMessage.editedAt
    });

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: originalMessage
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage
};