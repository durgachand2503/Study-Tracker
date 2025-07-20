# StudTrack Backend (Server)

This README documents all components of the `server` folder, including the full code for each file in `server/src` and its subdirectories.

---

## server/src/index.js
```js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB     = require('./config/db');
const authRoutes    = require('./routes/auth');
const channelRoutes = require('./routes/channelRoutes');

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use('/api/auth',     authRoutes);
app.use('/api/channels',  channelRoutes);
app.get('/', (req,res) => res.send('StudTrack API running'));

const PORT = process.env.PORT||5000;
app.listen(PORT,()=>console.log(`🚀 Server on port ${PORT}`));
```

---

## server/src/routes/auth.js
```js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const router  = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, username, email, password, role } = req.body;
  try {
    if (await User.findOne({ $or: [{ email }, { username }] })) {
      return res.status(400).json({ msg: 'Email or username already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, username, email, password: hashed, role });
    await user.save();
    const token = jwt.sign({ id: user._id, name, username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name, username, role } });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, name: user.name, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, username: user.username, role: user.role } });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
```

---

## server/src/routes/channelRoutes.js
```js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/channelController');

// Public
router.get('/',       ctrl.getChannels);

// Protected
router.post('/',      auth, ctrl.createChannel);
router.get('/:id',    auth, ctrl.getChannelById);
router.put('/:id',    auth, ctrl.updateChannel);
router.delete('/:id', auth, ctrl.deleteChannel);
router.post('/:id/join', auth, ctrl.joinChannel);

module.exports = router;
```

---

## server/src/middleware/auth.js
```js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
```

---

## server/src/controllers/channelController.js
```js
const MentorChannel = require('../models/MentorChannel');

exports.createChannel = async (req, res) => {
  try {
    const channel = new MentorChannel({ ...req.body, mentorId: req.user.id });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getChannels = async (req, res) => {
  const filter = { visibility: 'public' };
  if (req.query.tag) filter.subjectTags = req.query.tag;
  const channels = await MentorChannel.find(filter).populate('mentorId','name username');
  res.json(channels);
};

exports.getChannelById = async (req, res) => {
  try {
    const ch = await MentorChannel.findById(req.params.id)
      .populate('mentorId','name username')
      .populate('members','name username');
    if (!ch) return res.status(404).json({ msg: 'Channel not found' });
    res.json(ch);
  } catch {
    res.status(400).json({ msg: 'Invalid channel ID' });
  }
};

exports.joinChannel = async (req, res) => {
  try {
    const ch = await MentorChannel.findById(req.params.id);
    if (!ch) return res.status(404).json({ msg: 'Not found' });
    if (ch.members.includes(req.user.id))
      return res.status(400).json({ msg: 'Already joined' });
    ch.members.push(req.user.id);
    await ch.save();
    res.json({ msg: 'Joined channel' });
  } catch {
    res.status(500).json({ msg: 'Join failed' });
  }
};
exports.leaveChannel = async (req, res) => {
  try {
    const ch = await MentorChannel.findById(req.params.id);
    if (!ch) return res.status(404).json({ msg: 'Not found' });
    if (!ch.members.includes(req.user.id))
      return res.status(400).json({ msg: 'Not a member' });
    ch.members.pull(req.user.id);
    await ch.save();
    res.json({ msg: 'Left channel' });
  } catch {
    res.status(500).json({ msg: 'Leave failed' });
  }
};

// UPDATE channel (mentor only)
exports.updateChannel = async (req, res) => {
  try {
    const updated = await MentorChannel.findOneAndUpdate(
      { _id: req.params.id, mentorId: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!updated) return res.status(403).json({ msg: 'Not authorized or channel not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// DELETE channel (mentor only)
exports.deleteChannel = async (req, res) => {
  try {
    const deleted = await MentorChannel.findOneAndDelete({
      _id: req.params.id,
      mentorId: req.user.id
    });
    if (!deleted) return res.status(403).json({ msg: 'Not authorized or channel not found' });
    res.json({ msg: 'Channel deleted' });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
```

---

## server/src/models/MentorChannel.js
```js
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
```

---

## server/src/models/User.js
```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['student','mentor'], default: 'student' },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

---

## server/src/config/db.js
```js
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};
```
