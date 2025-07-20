const MentorChannel = require('../models/MentorChannel');

// Create a new channel (existing)
exports.createChannel = async (req, res) => {
  try {
    const channel = new MentorChannel({ ...req.body, mentorId: req.user.id });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// List public channels (existing)
exports.getChannels = async (req, res) => {
  const filter = { visibility: 'public' };
  if (req.query.tag) filter.subjectTags = req.query.tag;
  const channels = await MentorChannel.find(filter).populate('mentorId', 'name username');
  res.json(channels);
};

// Get channel by ID (existing)
exports.getChannelById = async (req, res) => {
  try {
    const ch = await MentorChannel.findById(req.params.id)
      .populate('mentorId', 'name username')
      .populate('members', 'name username')
      .populate('videos'); // videos subdocs
    if (!ch) return res.status(404).json({ msg: 'Channel not found' });
    res.json(ch);
  } catch {
    res.status(400).json({ msg: 'Invalid channel ID' });
  }
};

// Join a channel (existing)
exports.joinChannel = async (req, res) => {
  try {
    const ch = await MentorChannel.findById(req.params.id);
    if (!ch) return res.status(404).json({ msg: 'Channel not found' });
    if (ch.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already joined' });
    }
    ch.members.push(req.user.id);
    await ch.save();
    res.json({ msg: 'Joined channel' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Add a video link (mentor only)
exports.addVideo = async (req, res) => {
  try {
    const { url, title, description } = req.body;
    const ch = await MentorChannel.findOne({ _id: req.params.id, mentorId: req.user.id });
    if (!ch) return res.status(403).json({ msg: 'Not authorized or channel not found' });

    const video = { url, title, description, uploadedAt: Date.now() };
    ch.videos.push(video);
    await ch.save();
    res.status(201).json(ch.videos[ch.videos.length - 1]);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete a video by its subdocument ID (mentor only)
exports.deleteVideo = async (req, res) => {
  try {
    const ch = await MentorChannel.findOne({ _id: req.params.id, mentorId: req.user.id });
    if (!ch) return res.status(403).json({ msg: 'Not authorized or channel not found' });

    const vidId = req.params.videoId;
    const subdoc = ch.videos.id(vidId);
    if (!subdoc) return res.status(404).json({ msg: 'Video not found' });

    subdoc.remove();
    await ch.save();
    res.json({ msg: 'Video removed' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
