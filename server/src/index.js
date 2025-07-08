require('dotenv').config();
const path    = require('path');
const express = require('express');
const cors    = require('cors');

const connectDB     = require('./config/db');
const authRoutes    = require('./routes/auth');
// const sessionRoutes = require('./routes/sessionRoutes');
// const taskRoutes    = require('./routes/taskRoutes');
// … import other routers here …

const app = express();

// 1) Middleware
app.use(cors());                   // allow cross‑origin requests from your client
app.use(express.json());           // parse JSON bodies

// 2) Connect to MongoDB
connectDB();

// 3) API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/tasks', taskRoutes);
// … mount other routers similarly …

// 4) Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'MongoDB is live 🔥' });
});

// 5) Serve frontend (optional: once you build your client)
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'public');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 6) Root health check
app.get('/', (req, res) => res.send('StudTrack API running'));

// 7) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
