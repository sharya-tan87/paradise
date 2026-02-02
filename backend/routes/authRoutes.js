const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

// Login Route
router.post('/login', authController.login);

// Refresh Token Route
router.post('/refresh', authController.refresh);

// Logout Route - Invalidates refresh token
router.post('/logout', authenticate, authController.logout);

// Protected Route for Testing/User Info
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
