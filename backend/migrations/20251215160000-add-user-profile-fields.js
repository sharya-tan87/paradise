'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add firstName column
        await queryInterface.addColumn('Users', 'firstName', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        // Add lastName column
        await queryInterface.addColumn('Users', 'lastName', {
            type: Sequelize.STRING(100),
            allowNull: true
        });

        // Add active column
        await queryInterface.addColumn('Users', 'active', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'firstName');
        await queryInterface.removeColumn('Users', 'lastName');
        await queryInterface.removeColumn('Users', 'active');
    }
};
