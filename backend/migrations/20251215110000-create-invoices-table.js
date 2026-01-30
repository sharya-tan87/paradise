'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('invoices', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            invoiceNumber: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            patientHN: {
                type: Sequelize.STRING(50),
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'hn'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            invoiceDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            dueDate: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            lineItems: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: []
            },
            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            taxAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            totalAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            paymentStatus: {
                type: Sequelize.ENUM('unpaid', 'partially-paid', 'paid'),
                defaultValue: 'unpaid'
            },
            paymentDate: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            paymentMethod: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            createdBy: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
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

        // Add indexes
        await queryInterface.addIndex('invoices', ['invoiceNumber']);
        await queryInterface.addIndex('invoices', ['patientHN']);
        await queryInterface.addIndex('invoices', ['paymentStatus']);
        await queryInterface.addIndex('invoices', ['invoiceDate']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('invoices');
    }
};
