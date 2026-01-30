const express = require('express');
const router = express.Router();
const {
    listUsers,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    resetPassword,
    deleteUser
} = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected and restricted to admin ONLY

// GET /api/admin/users
router.get(
    '/users',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    listUsers
);

// POST /api/admin/users
router.post(
    '/users',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    createUser
);

// PATCH /api/admin/users/:id
router.patch(
    '/users/:id',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    updateUser
);

// DELETE /api/admin/users/:id (deactivate)
router.delete(
    '/users/:id',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    deactivateUser
);

// POST /api/admin/users/:id/activate
router.post(
    '/users/:id/activate',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    activateUser
);

// POST /api/admin/users/:id/reset-password
router.post(
    '/users/:id/reset-password',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    resetPassword
);

// DELETE /api/admin/users/:id/hard-delete (permanent delete)
router.delete(
    '/users/:id/hard-delete',
    authenticate,
    authorizeRole(['admin', 'manager', 'staff']),
    deleteUser
);

module.exports = router;
