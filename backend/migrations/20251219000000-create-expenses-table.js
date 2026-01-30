'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Expenses', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            expenseDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            category: {
                type: Sequelize.ENUM('Salaries', 'Supplies', 'Utilities', 'Rent', 'Equipment', 'Marketing', 'Other'),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            vendor: {
                type: Sequelize.STRING,
                allowNull: true
            },
            receiptUrl: {
                type: Sequelize.STRING,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex('Expenses', ['category']);
        await queryInterface.addIndex('Expenses', ['expenseDate']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Expenses');
    }
};
