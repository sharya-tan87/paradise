const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected and restricted to manager and admin only
// Staff, dentist, and patients are excluded

// GET /api/analytics/dashboard
router.get(
    '/dashboard',
    authenticate,
    authorizeRole(['manager', 'admin']),
    getDashboardMetrics
);

// GET /api/analytics/dentist
router.get(
    '/dentist',
    authenticate,
    authorizeRole(['dentist']),
    require('../controllers/analyticsController').getDentistMetrics
);

module.exports = router;
