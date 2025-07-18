const express = require('express');
const { 
  getWeeklyPatterns, 
  getSubjectDistribution, 
  getTimeSlotAnalysis, 
  getDashboardStats, 
  getStudyHeatmap 
} = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/weekly-patterns',getWeeklyPatterns);
router.get('/subject-distribution', getSubjectDistribution);
router.get('/time-slots', getTimeSlotAnalysis);
router.get('/dashboard-stats', getDashboardStats);
router.get('/study-heatmap', getStudyHeatmap);

module.exports = router;