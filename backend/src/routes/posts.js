const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById, createPost, votePost } = require('../controllers/postController');
const { moderateContent } = require('../middleware/moderation');

// GET /api/posts?tag=career&sort=new&page=1&limit=10
router.get('/', getAllPosts);

// GET /api/posts/:id
router.get('/:id', getPostById);

// POST /api/posts
router.post('/', moderateContent, createPost);

// POST /api/posts/:id/vote
router.post('/:id/vote', votePost);

module.exports = router;
