'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('treatments', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
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
            appointmentId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'appointments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            treatmentDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            procedureCodes: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: []
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            toothNumbers: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: []
            },
            performedBy: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            clinicalNotes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            estimatedCost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00
            },
            status: {
                type: Sequelize.ENUM('planned', 'in-progress', 'completed'),
                defaultValue: 'planned'
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
        await queryInterface.addIndex('treatments', ['patientHN']);
        await queryInterface.addIndex('treatments', ['performedBy']);
        await queryInterface.addIndex('treatments', ['treatmentDate']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('treatments');
    }
};
