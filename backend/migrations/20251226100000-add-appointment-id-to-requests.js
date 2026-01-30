'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('appointment_requests', 'appointment_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'appointments',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('appointment_requests', 'appointment_id');
    }
};
