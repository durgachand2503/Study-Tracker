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
