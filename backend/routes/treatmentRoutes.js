const express = require('express');
const router = express.Router();
const {
    getTreatments,
    createTreatment,
    updateTreatment,
    getTreatmentDetails
} = require('../controllers/treatmentController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected and restricted to specific roles
// Staff can view and manage treatments

// GET /api/treatments
router.get(
    '/',
    authenticate,
    authorizeRole(['staff', 'dentist', 'manager', 'admin']),
    getTreatments
);

// POST /api/treatments
router.post(
    '/',
    authenticate,
    authorizeRole(['staff', 'dentist', 'manager', 'admin']),
    createTreatment
);

// GET /api/treatments/:id
router.get(
    '/:id',
    authenticate,
    authorizeRole(['staff', 'dentist', 'manager', 'admin']),
    getTreatmentDetails
);

// PATCH /api/treatments/:id
router.patch(
    '/:id',
    authenticate,
    authorizeRole(['staff', 'dentist', 'manager', 'admin']),
    updateTreatment
);

module.exports = router;
