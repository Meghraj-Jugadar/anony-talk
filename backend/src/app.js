require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const { deleteExpiredPosts } = require('./controllers/postController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:4200',
    process.env.FRONTEND_URL || 'https://anony-talk-olive.vercel.app',
    'https://anony-talk-olive.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/posts/:postId/comments', require('./routes/comments'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'AnonyTalk API running' }));

app.use(errorHandler);

// Auto-delete expired posts every hour
setInterval(deleteExpiredPosts, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`AnonyTalk backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB init failed:', err.message);
    app.listen(PORT, () => console.log(`AnonyTalk backend running on port ${PORT} (DB failed)`));
  });
