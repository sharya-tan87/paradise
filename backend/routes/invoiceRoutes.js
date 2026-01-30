const express = require('express');
const router = express.Router();
const {
    listInvoices,
    getInvoice,
    createInvoice,
    recordPayment
} = require('../controllers/invoiceController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected and restricted to staff, manager, admin
// Dentists and patients are excluded as per requirements

// GET /api/invoices
router.get(
    '/',
    authenticate,
    authorizeRole(['staff', 'manager', 'admin', 'dentist']),
    listInvoices
);

// POST /api/invoices
router.post(
    '/',
    authenticate,
    authorizeRole(['staff', 'manager', 'admin', 'dentist']),
    createInvoice
);

// GET /api/invoices/:invoiceNumber
router.get(
    '/:invoiceNumber',
    authenticate,
    authorizeRole(['staff', 'manager', 'admin', 'dentist']),
    getInvoice
);

// PATCH /api/invoices/:id/payment
router.patch(
    '/:id/payment',
    authenticate,
    authorizeRole(['staff', 'manager', 'admin', 'dentist']),
    recordPayment
);

module.exports = router;
