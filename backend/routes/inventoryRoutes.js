const express = require('express');
const router = express.Router();
const {
    listInventory,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/inventoryController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// All routes are protected - staff, admin and manager can access

router.get(
    '/',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    listInventory
);

router.post(
    '/',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    createItem
);

router.patch(
    '/:id',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    updateItem
);

router.delete(
    '/:id',
    authenticate,
    authorizeRole(['staff', 'admin', 'manager']),
    deleteItem
);

module.exports = router;
