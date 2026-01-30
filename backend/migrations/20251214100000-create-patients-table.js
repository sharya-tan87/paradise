'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('patients', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            hn: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            title: {
                type: Sequelize.ENUM('Mr.', 'Ms.', 'Mrs.', 'Dr.'),
                allowNull: false
            },
            firstName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            lastName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            dateOfBirth: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            gender: {
                type: Sequelize.ENUM('male', 'female', 'other'),
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            emergencyContactName: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            emergencyContactPhone: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            medicalHistory: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            allergies: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            currentMedications: {
                type: Sequelize.TEXT,
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

        // Add indexes for performance
        await queryInterface.addIndex('patients', ['hn']);
        await queryInterface.addIndex('patients', ['email']);
        await queryInterface.addIndex('patients', ['phone']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('patients');
    }
};
