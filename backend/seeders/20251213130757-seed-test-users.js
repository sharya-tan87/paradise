'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('password123', 10);

    return queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        username: 'admin',
        password_hash: passwordHash,
        role: 'admin',
        email: 'admin@paradisedental.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'manager',
        password_hash: passwordHash,
        role: 'manager',
        email: 'manager@paradisedental.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'dentist',
        password_hash: passwordHash,
        role: 'dentist',
        email: 'dentist@paradisedental.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'staff',
        password_hash: passwordHash,
        role: 'staff',
        email: 'staff@paradisedental.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'patient',
        password_hash: passwordHash,
        role: 'patient',
        email: 'patient@paradisedental.com',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
