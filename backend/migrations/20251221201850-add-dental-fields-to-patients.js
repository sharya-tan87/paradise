'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('patients', 'dentalComplaint', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('patients', 'lastDentalVisit', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('patients', 'lastDentalVisit');
    await queryInterface.removeColumn('patients', 'dentalComplaint');
  }
};
