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

// All routes are protected and restricted to admin/manager roles
// SECURITY FIX: Removed 'staff' from admin routes - privilege escalation vulnerability

// GET /api/admin/users - Admin and Manager can view users
router.get(
    '/users',
    authenticate,
    authorizeRole(['admin', 'manager']),
    listUsers
);

// POST /api/admin/users - Only Admin can create users
router.post(
    '/users',
    authenticate,
    authorizeRole(['admin']),
    createUser
);

// PATCH /api/admin/users/:id - Admin and Manager can update users
router.patch(
    '/users/:id',
    authenticate,
    authorizeRole(['admin', 'manager']),
    updateUser
);

// DELETE /api/admin/users/:id (deactivate) - Admin and Manager can deactivate
router.delete(
    '/users/:id',
    authenticate,
    authorizeRole(['admin', 'manager']),
    deactivateUser
);

// POST /api/admin/users/:id/activate - Admin and Manager can activate
router.post(
    '/users/:id/activate',
    authenticate,
    authorizeRole(['admin', 'manager']),
    activateUser
);

// POST /api/admin/users/:id/reset-password - Only Admin can reset passwords
router.post(
    '/users/:id/reset-password',
    authenticate,
    authorizeRole(['admin']),
    resetPassword
);

// DELETE /api/admin/users/:id/hard-delete (permanent delete) - Only Admin
router.delete(
    '/users/:id/hard-delete',
    authenticate,
    authorizeRole(['admin']),
    deleteUser
);

module.exports = router;
