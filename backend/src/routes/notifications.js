const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead } = require('../controllers/notificationController');

// GET /api/notifications?session_id=xxx
router.get('/', getNotifications);

// POST /api/notifications/read
router.post('/read', markAllRead);

module.exports = router;
