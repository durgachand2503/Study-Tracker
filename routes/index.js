const express = require('express');
const authRoutes = require('./auth');
const sessionRoutes = require('./sessions');
const taskRoutes = require('./tasks');
const analyticsRoutes = require('./analytics');
const chatRoutes = require('./chat');
const dashboardRoutes = require('./dashboard'); // ✅ Add this line

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes); 

module.exports = router;