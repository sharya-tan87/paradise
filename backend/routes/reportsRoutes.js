const express = require('express');
const router = express.Router();
const {
    generatePandL,
    generateDailyCollections,
    generateMonthlySummary
} = require('../controllers/reportsController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected and restricted to manager and admin only

// GET /api/reports/p-and-l
router.get(
    '/p-and-l',
    authenticate,
    authorizeRole(['manager', 'admin']),
    generatePandL
);

// GET /api/reports/daily-collections
router.get(
    '/daily-collections',
    authenticate,
    authorizeRole(['manager', 'admin']),
    generateDailyCollections
);

// GET /api/reports/monthly-summary
router.get(
    '/monthly-summary',
    authenticate,
    authorizeRole(['manager', 'admin']),
    generateMonthlySummary
);

module.exports = router;
