const express = require('express');
const router = express.Router();
const { getOrCreateIdentity, recoverIdentity } = require('../controllers/identityController');

// GET /api/identity — get or create anonymous identity
router.get('/', getOrCreateIdentity);

// POST /api/identity/recover — recover identity using recovery code
router.post('/recover', recoverIdentity);

module.exports = router;
