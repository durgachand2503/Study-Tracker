
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 30
  },
  actualDuration: {
    type: Number, // in minutes
    default: 0
  },
  resources: {
  type: [String],
  default: []
  },
  tags: [{
    type: String,
    trim: true
  }],
  completedAt: {
    type: Date
  },
  subject: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Update status based on due date and completion
taskSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (this.status !== 'completed' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  
  next();
});

// Index for better query performance
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema);