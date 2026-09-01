const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const animeRoutes = require('./routes/animeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const anilistRoutes = require('./routes/anilistRoutes');
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/anilist', anilistRoutes);
app.get('/', (req, res) => {
  res.send('Risuto Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
