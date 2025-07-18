const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now // ✅ Auto-generated if not provided
  },
  endTime: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Auto-calculate duration before saving
sessionSchema.pre('save', function (next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
    this.isActive = false;
  }
  next();
});

// Indexes for performance
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model('Session', sessionSchema);