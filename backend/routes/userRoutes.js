const express = require('express');
const router = express.Router();
const multer = require('multer');
const { listUsers, updateUserProfile } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Protected Routes
router.use(authenticate);

// GET /api/users
// Filter by role query param ?role=dentist
router.get(
    '/',
    authorizeRole(['admin', 'manager', 'staff', 'dentist']),
    listUsers
);

// PATCH /api/users/:id/profile
// Update user's own profile
router.patch(
    '/:id/profile',
    upload.single('image'),
    updateUserProfile
);

module.exports = router;
