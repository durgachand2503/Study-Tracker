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
