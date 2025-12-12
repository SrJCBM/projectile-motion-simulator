/**
 * Report Routes
 * 
 * Routes for PDF report generation
 */

const express = require('express');
const router = express.Router();

const { generateReport } = require('../controllers/reportController');
const { optionalAuth } = require('../middleware/auth');

// Report generation (optional auth - can be used without login)
router.post('/generate', optionalAuth, generateReport);

module.exports = router;
