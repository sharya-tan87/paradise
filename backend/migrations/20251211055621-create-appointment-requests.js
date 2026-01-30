'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      request_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Unique human-readable request identifier (e.g., REQ-2025-001)'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Patient full name'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Patient phone number in Thai format'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Patient email address'
      },
      preferred_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Preferred appointment date'
      },
      preferred_time: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Preferred appointment time slot'
      },
      service_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Type of dental service requested'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional notes from patient'
      },
      status: {
        type: Sequelize.ENUM('pending', 'contacted', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Current status of the appointment request'
      },
      email_sent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether admin notification email was sent'
      },
      sms_sent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether patient confirmation SMS was sent'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the requester'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Browser user agent string'
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

    // Add indexes
    await queryInterface.addIndex('appointment_requests', ['request_id'], {
      unique: true,
      name: 'idx_appointment_requests_request_id'
    });
    await queryInterface.addIndex('appointment_requests', ['email'], {
      name: 'idx_appointment_requests_email'
    });
    await queryInterface.addIndex('appointment_requests', ['phone'], {
      name: 'idx_appointment_requests_phone'
    });
    await queryInterface.addIndex('appointment_requests', ['status'], {
      name: 'idx_appointment_requests_status'
    });
    await queryInterface.addIndex('appointment_requests', ['preferred_date'], {
      name: 'idx_appointment_requests_preferred_date'
    });
    await queryInterface.addIndex('appointment_requests', ['created_at'], {
      name: 'idx_appointment_requests_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointment_requests');
  }
};
