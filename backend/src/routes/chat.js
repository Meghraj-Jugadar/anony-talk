const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chatController');

// GET /api/chat/:postId?session_id=xxx
router.get('/:postId', getChatHistory);

module.exports = router;
