const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// Public routes (for booking form, etc.)
router.get('/public', serviceController.getAllServices);
router.get('/categories', serviceController.getCategories);

// Protected routes
router.get('/', authenticate, authorizeRole(['admin', 'manager', 'dentist', 'staff']), serviceController.getAllServices);
router.get('/:id', authenticate, authorizeRole(['admin', 'manager', 'dentist', 'staff']), serviceController.getServiceById);

// Admin/Manager only routes
router.post('/', authenticate, authorizeRole(['admin', 'manager']), serviceController.createService);
router.put('/:id', authenticate, authorizeRole(['admin', 'manager']), serviceController.updateService);
router.delete('/:id', authenticate, authorizeRole(['admin', 'manager']), serviceController.deleteService);
router.patch('/:id/toggle', authenticate, authorizeRole(['admin', 'manager']), serviceController.toggleServiceStatus);

module.exports = router;
