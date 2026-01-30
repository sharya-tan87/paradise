'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('appointments', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            patientHN: {
                type: Sequelize.STRING(50),
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'hn'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            appointmentDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            startTime: {
                type: Sequelize.TIME,
                allowNull: false
            },
            endTime: {
                type: Sequelize.TIME,
                allowNull: false
            },
            serviceType: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
                defaultValue: 'scheduled'
            },
            dentistId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdBy: {
                type: Sequelize.UUID,
                allowNull: true
            },
            updatedBy: {
                type: Sequelize.UUID,
                allowNull: true
            },
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add indexes
        await queryInterface.addIndex('appointments', ['patientHN']);
        await queryInterface.addIndex('appointments', ['dentistId']);
        await queryInterface.addIndex('appointments', ['appointmentDate']);
        await queryInterface.addIndex('appointments', ['status']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('appointments');
    }
};
