const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/reportController');

// POST /api/reports
router.post('/', createReport);

module.exports = router;
