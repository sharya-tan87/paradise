const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/admin-only', authenticate, authorizeRole(['admin']), (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
});

router.get('/staff-only', authenticate, authorizeRole(['staff']), (req, res) => {
    // Note: Admin, Manager, Dentist should also be able to access this via hierarchy logic
    res.json({ message: 'Access granted', user: req.user });
});

router.get('/staff-and-above', authenticate, authorizeRole(['staff', 'dentist', 'manager', 'admin']), (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
});

module.exports = router;
