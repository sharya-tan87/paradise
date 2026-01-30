const express = require('express');
const router = express.Router();
const {
    listExpenses,
    createExpense,
    updateExpense,
    deleteExpense
} = require('../controllers/expenseController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected - staff, admin and manager can access

router.get(
    '/',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    listExpenses
);

router.post(
    '/',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    createExpense
);

router.patch(
    '/:id',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    updateExpense
);

router.delete(
    '/:id',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    deleteExpense
);

module.exports = router;
