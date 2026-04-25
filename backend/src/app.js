require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDB } = require('./config/db');
const { deleteExpiredPosts } = require('./controllers/postController');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

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

// HTTP request logger using morgan + winston
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/posts/:postId/comments', require('./routes/comments'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'AnonyTalk API running' });
});

app.use(errorHandler);

// Auto-delete expired posts every hour
setInterval(deleteExpiredPosts, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    logger.info('Database initialized');
    app.listen(PORT, () => logger.info(`AnonyTalk backend running on port ${PORT}`));
  })
  .catch((err) => {
    logger.error(`DB init failed: ${err.message}`);
    app.listen(PORT, () => logger.warn(`AnonyTalk backend running on port ${PORT} (DB failed)`));
  });
