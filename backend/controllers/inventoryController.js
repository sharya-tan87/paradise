const { InventoryItem, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.listInventory = async (req, res) => {
    try {
        const { lowStock } = req.query;
        let whereClause = {};

        if (lowStock === 'true') {
            whereClause = {
                quantity: {
                    [Op.lte]: sequelize.col('reorderLevel')
                }
            };
        }

        const items = await InventoryItem.findAll({
            where: whereClause,
            order: [['itemName', 'ASC']]
        });

        // If lowStock filtering via Sequelize col ref is tricky with SQLite/some dialects without raw query or specific config,
        // we can filter in JS for simplicity if dataset is small, but let's try strict database approach OR simple approach.
        // Actually, Op.lte col('reorderLevel') is standard in Sequelize.
        // However, let's verify if `sequelize` is imported or available in scope. It's not.
        // I need to import sequelize from models if I want to use sequelize.col.
        // Alternatively, I can just fetch all and filter in memory if the dataset is small, but DB way is better.
        // Let's import sequelize.

        res.json(items);
    } catch (error) {
        console.error('Error listing inventory:', error);
        res.status(500).json({ error: 'Failed to list inventory' });
    }
};

exports.createItem = async (req, res) => {
    try {
        const { itemName, quantity, reorderLevel, unitCost, supplier } = req.body;

        if (!itemName || quantity === undefined || reorderLevel === undefined || unitCost === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const item = await InventoryItem.create({
            itemName,
            quantity,
            reorderLevel,
            unitCost,
            supplier
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Failed to create inventory item' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemName, quantity, reorderLevel, unitCost, supplier } = req.body;

        const item = await InventoryItem.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const updateData = {};
        if (itemName !== undefined) updateData.itemName = itemName;
        if (quantity !== undefined) updateData.quantity = quantity;
        if (reorderLevel !== undefined) updateData.reorderLevel = reorderLevel;
        if (unitCost !== undefined) updateData.unitCost = unitCost;
        if (supplier !== undefined) updateData.supplier = supplier;

        await item.update(updateData);

        res.json(item);
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await InventoryItem.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        await item.destroy();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
};
