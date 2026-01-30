const express = require('express');
const router = express.Router();
const {
    createPatient,
    listPatients,
    getPatient,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected and require specific roles
const allowedRoles = ['staff', 'dentist', 'manager', 'admin'];
router.use(authenticate);
router.use(authorizeRole(allowedRoles));

// GET /api/patients - List patients
router.get('/', listPatients);

// POST /api/patients - Create patient
router.post('/', createPatient);

// GET /api/patients/:hn - Get patient details
router.get('/:hn', getPatient);

// PATCH /api/patients/:hn - Update patient
router.patch('/:hn', updatePatient);

// DELETE /api/patients/:hn - Deactivate patient
router.delete('/:hn', deletePatient);

module.exports = router;
