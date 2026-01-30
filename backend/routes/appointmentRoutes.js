/**
 * Appointment Routes
 * API routes for appointment request handling
 */
const express = require('express');
const router = express.Router();
const {
    createAppointmentRequest,
    getAppointmentRequest,
    listAppointmentRequests,
    updateAppointmentStatus
} = require('../controllers/appointmentController');
const {
    getCalendarAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/calendarController');
const {
    appointmentValidationRules,
    validateAppointmentRequest
} = require('../middleware/validateAppointmentRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

/**
 * Public Routes
 */

// Create a new appointment request
// POST /api/appointments/request
router.post(
    '/request',
    appointmentValidationRules,
    validateAppointmentRequest,
    createAppointmentRequest
);

/**
 * Protected Routes
 */

// Calendar Events
// GET /api/appointments/calendar
router.get(
    '/calendar',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff', 'dentist']),
    getCalendarAppointments
);

// Create actual appointment (internal)
// POST /api/appointments
router.post(
    '/',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff', 'dentist']),
    createAppointment
);

// Update actual appointment
// PATCH /api/appointments/:id
router.patch(
    '/:id',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff', 'dentist']),
    updateAppointment
);

// Delete actual appointment
// DELETE /api/appointments/:id
router.delete(
    '/:id',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff', 'dentist']),
    deleteAppointment
);

// List all appointment requests
// GET /api/appointments
router.get(
    '/',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    listAppointmentRequests
);

// Update appointment status (Requests)
// PATCH /api/appointments/:requestId/status
router.patch(
    '/:requestId/status',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    updateAppointmentStatus
);

// Get a specific appointment request
// GET /api/appointments/:requestId
router.get(
    '/:requestId',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    getAppointmentRequest
);

module.exports = router;
