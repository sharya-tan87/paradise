'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create dentist_profiles table
        await queryInterface.createTable('dentist_profiles', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            licenseNumber: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            specializations: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: []
            },
            certificates: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: []
            },
            education: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: []
            },
            experience: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            bio: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            bioTh: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            consultationFee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            availableDays: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: [1, 2, 3, 4, 5]
            },
            workingHours: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: { start: "09:00", end: "17:00" }
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Create dentist_services junction table
        await queryInterface.createTable('dentist_services', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            dentistProfileId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'dentist_profiles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            serviceId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'services',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            customPrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Add unique constraint for dentist-service combination
        await queryInterface.addIndex('dentist_services', ['dentistProfileId', 'serviceId'], {
            unique: true,
            name: 'dentist_services_unique'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('dentist_services');
        await queryInterface.dropTable('dentist_profiles');
    }
};
