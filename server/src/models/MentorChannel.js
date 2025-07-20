const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  url:         { type: String, required: true },
  title:       { type: String, required: true },
  description: String,
  uploadedAt:  { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  dueDate:     { type: Date, required: true },
  createdAt:   { type: Date, default: Date.now },
  submissions: [{
    studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now },
    files:       [String],
    grade:       Number,
    feedback:    String
  }]
});

const mentorChannelSchema = new mongoose.Schema({
  mentorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: String,
  subjectTags: [String],
  visibility:  { type: String, enum: ['public','private'], default: 'public' },
  videos:      [videoSchema],
  assignments: [assignmentSchema],
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('MentorChannel', mentorChannelSchema);
