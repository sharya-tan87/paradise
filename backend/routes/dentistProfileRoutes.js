const express = require('express');
const router = express.Router();
const dentistProfileController = require('../controllers/dentistProfileController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// Get specialization options
router.get('/specializations', authenticate, dentistProfileController.getSpecializations);

// Get all dentist profiles
router.get('/', authenticate, authorizeRole(['admin', 'manager', 'staff']), dentistProfileController.getAllDentistProfiles);

// Get dentist profile by user ID
router.get('/user/:userId', authenticate, dentistProfileController.getDentistProfileByUserId);

// Get dentist profile by ID
router.get('/:id', authenticate, dentistProfileController.getDentistProfileById);

const upload = require('../middleware/upload');

// Create or update dentist profile (dentist can update their own, admin/manager/staff can update any)
router.put('/user/:userId', authenticate, authorizeRole(['admin', 'manager', 'staff', 'dentist']), upload.single('image'), dentistProfileController.upsertDentistProfile);

// Update dentist services
router.put('/:id/services', authenticate, authorizeRole(['admin', 'manager', 'staff', 'dentist']), dentistProfileController.updateDentistServices);

// Delete dentist profile (admin only)
router.delete('/:id', authenticate, authorizeRole(['admin']), dentistProfileController.deleteDentistProfile);

module.exports = router;
