const Session = require('../models/Session');
const Task = require('../models/Task');

const getWeeklyPatterns = async (req, res) => {
  try {
    const { weeks = 4 } = req.query;
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));

    const weeklyData = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: weeksAgo },
          isActive: false
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$startTime' },
            year: { $year: '$startTime' }
          },
          totalDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
          subjects: { $addToSet: '$subject' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 }
      }
    ]);

    res.json({
      success: true,
      data: weeklyData
    });
  } catch (error) {
    console.error('Get weekly patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly patterns',
      error: error.message
    });
  }
};

const getSubjectDistribution = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const subjectData = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: daysAgo },
          isActive: false
        }
      },
      {
        $group: {
          _id: '$subject',
          totalDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      },
      {
        $sort: { totalDuration: -1 }
      }
    ]);

    res.json({
      success: true,
      data: subjectData
    });
  } catch (error) {
    console.error('Get subject distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject distribution',
      error: error.message
    });
  }
};

const getTimeSlotAnalysis = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const timeSlotData = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: daysAgo },
          isActive: false
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$startTime' },
            dayOfWeek: { $dayOfWeek: '$startTime' }
          },
          totalDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 }
      }
    ]);

    res.json({
      success: true,
      data: timeSlotData
    });
  } catch (error) {
    console.error('Get time slot analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time slot analysis',
      error: error.message
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Session stats
    const sessionStats = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: startDate },
          isActive: false
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          uniqueSubjects: { $addToSet: '$subject' }
        }
      }
    ]);

    // Task stats
    const taskStats = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Productivity score calculation
    const completedTasks = taskStats.find(stat => stat._id === 'completed')?.count || 0;
    const totalTasks = taskStats.reduce((sum, stat) => sum + stat.count, 0);
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const stats = {
      sessions: sessionStats[0] || {
        totalSessions: 0,
        totalDuration: 0,
        avgDuration: 0,
        uniqueSubjects: []
      },
      tasks: taskStats,
      productivity: {
        completionRate: Math.round(completionRate),
        totalTasks,
        completedTasks
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

const getStudyHeatmap = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    const heatmapData = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: monthsAgo },
          isActive: false
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$startTime'
              }
            }
          },
          totalDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    console.error('Get study heatmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study heatmap',
      error: error.message
    });
  }
};

module.exports = {
  getWeeklyPatterns,
  getSubjectDistribution,
  getTimeSlotAnalysis,
  getDashboardStats,
  getStudyHeatmap
};
