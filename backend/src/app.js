require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const { initDB } = require('./config/db');
const { deleteExpiredPosts } = require('./controllers/postController');
const { getChatResponse } = require('./utils/groq');
const { saveChatMessage } = require('./controllers/chatController');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:4200',
  process.env.FRONTEND_URL || 'https://anony-talk-olive.vercel.app',
  'https://anony-talk-olive.vercel.app',
];

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/identity', require('./routes/identity'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/posts/:postId/comments', require('./routes/comments'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'AnonyTalk API running' }));

app.use(errorHandler);

// Socket.io — AI Chat Room + Notifications
const chatHistories = {};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join post chat room
  socket.on('join_room', ({ postId, sessionId }) => {
    socket.join(postId);
    socket.data.sessionId = sessionId;
    console.log(`${sessionId} joined room ${postId}`);
  });

  // AI Chat message
  socket.on('chat_message', async ({ postId, postContext, message, sessionId }) => {
    if (!chatHistories[postId]) chatHistories[postId] = {};
    if (!chatHistories[postId][sessionId]) chatHistories[postId][sessionId] = [];

    // Save user message to DB
    await saveChatMessage(postId, sessionId, 'user', message);

    // Add user message to history
    chatHistories[postId][sessionId].push({ role: 'user', content: message });

    // Keep last 10 messages for context
    const history = chatHistories[postId][sessionId].slice(-10);

    // Get AI response
    const aiResponse = await getChatResponse(history, postContext);

    // Save AI response to DB
    await saveChatMessage(postId, sessionId, 'assistant', aiResponse);

    // Add AI response to history
    chatHistories[postId][sessionId].push({ role: 'assistant', content: aiResponse });

    // Send AI response back to user
    socket.emit('ai_response', { message: aiResponse });
  });

  // Notifications — join personal room
  socket.on('subscribe_notifications', ({ sessionId }) => {
    socket.join(`notif_${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Export io for use in controllers
app.set('io', io);

// Auto-delete expired posts every hour
setInterval(deleteExpiredPosts, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  server.listen(PORT, () => console.log(`AnonyTalk backend running on port ${PORT}`));
}).catch((err) => {
  console.error(`DB init failed: ${err.message}`);
  server.listen(PORT, () => console.log(`AnonyTalk backend running on port ${PORT} (DB failed)`));
});
