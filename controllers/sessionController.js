const Session = require('../models/Session');

const startSession = async (req, res) => {
  try {
    const { subject, startTime, notes, tags } = req.body;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    const session = new Session({
      userId: req.user.id,
      subject,
      startTime: startTime ? new Date(startTime) : undefined,
      notes,
      tags
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session started',
      data: session
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
};

const stopSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active session not found'
      });
    }

    session.endTime = new Date();
    if (notes) session.notes = notes;

    await session.save();

    res.json({
      success: true,
      message: 'Session stopped successfully',
      data: session
    });
  } catch (error) {
    console.error('Stop session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop session',
      error: error.message
    });
  }
};

const getSessionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, subject, startDate, endDate } = req.query;

    const query = {
      userId: req.user.id,
      isActive: false
    };

    if (subject) query.subject = subject;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSessions: total
        }
      }
    });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session history',
      error: error.message
    });
  }
};

const getActiveSession = async (req, res) => {
  try {
    const activeSession = await Session.findOne({
      userId: req.user.id,
      isActive: true
    });

    res.json({
      success: true,
      data: activeSession
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active session',
      error: error.message
    });
  }
};

module.exports = {
  startSession,
  stopSession,
  getSessionHistory,
  getActiveSession
};