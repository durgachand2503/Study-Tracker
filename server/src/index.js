require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());
connectDB();

app.get('/', (req, res) => res.send('StudTrack API running'));
app.get('/api/test', (req, res) => {
  res.json({ message: 'MongoDB is live ' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
