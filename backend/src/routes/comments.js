const express = require('express');
const router = express.Router({ mergeParams: true });
const { getComments, createComment, voteComment } = require('../controllers/commentController');
const { moderateComment } = require('../middleware/moderation');

// GET /api/posts/:postId/comments
router.get('/', getComments);

// POST /api/posts/:postId/comments
router.post('/', moderateComment, createComment);

// POST /api/comments/:id/vote
router.post('/:id/vote', voteComment);

module.exports = router;
