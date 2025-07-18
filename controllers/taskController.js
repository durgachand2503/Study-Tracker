const Task = require('../models/Task');

// 🆕 Create a new task

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      subject,
      estimatedDuration,
      resources,
      tags
    } = req.body;

    // Basic validation for required fields
    if (!title || !dueDate || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title, dueDate, and subject are required'
      });
    }

    const task = new Task({
      userId: req.user.id,
      title: title.trim(),
      description: description?.trim(),
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      subject: subject.trim(),
      estimatedDuration: estimatedDuration || 0,
      resources: Array.isArray(resources) ? resources : [],
      tags: Array.isArray(tags) ? tags : []
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

// 📋 Get tasks with filters and pagination
const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      subject,
      startDate,
      endDate,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    const query = { userId: req.user.id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (subject) query.subject = subject;
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTasks: total
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

// 🔍 Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

// ✏️ Update a task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message || 'Unknown error'
    });
  }
};

// 🗑️ Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

// 📊 Get task summary for dashboard
const getTaskSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ userId, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ userId, status: { $ne: 'completed' } });

    res.json({
      success: true,
      summary: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks
      }
    });
  } catch (error) {
    console.error('Get task summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task summary',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskSummary
};