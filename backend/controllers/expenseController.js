const { Expense } = require('../models');
const { Op } = require('sequelize');

exports.listExpenses = async (req, res) => {
    try {
        const { category, startDate, endDate } = req.query;
        const whereClause = {};

        if (category) {
            whereClause.category = category;
        }

        if (startDate || endDate) {
            whereClause.expenseDate = {};
            if (startDate) {
                whereClause.expenseDate[Op.gte] = startDate;
            }
            if (endDate) {
                whereClause.expenseDate[Op.lte] = endDate;
            }
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['expenseDate', 'DESC'], ['created_at', 'DESC']]
        });

        res.json(expenses);
    } catch (error) {
        console.error('Error listing expenses:', error);
        res.status(500).json({ error: 'Failed to list expenses' });
    }
};

exports.createExpense = async (req, res) => {
    try {
        const { expenseDate, category, description, amount, vendor, receiptUrl } = req.body;

        if (!expenseDate || !category || !description || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const expense = await Expense.create({
            expenseDate,
            category,
            description,
            amount,
            vendor,
            receiptUrl
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { expenseDate, category, description, amount, vendor, receiptUrl } = req.body;

        const expense = await Expense.findByPk(id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const updateData = {};
        if (expenseDate !== undefined) updateData.expenseDate = expenseDate;
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (amount !== undefined) updateData.amount = amount;
        if (vendor !== undefined) updateData.vendor = vendor;
        if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;

        await expense.update(updateData);

        res.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByPk(id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await expense.destroy();
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};
