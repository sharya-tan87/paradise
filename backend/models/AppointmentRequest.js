/**
 * Appointment Request Model
 * Stores appointment requests from the public booking form
 */
'use strict';

module.exports = (sequelize, DataTypes) => {
    const AppointmentRequest = sequelize.define('AppointmentRequest', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        requestId: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            field: 'request_id',
            comment: 'Unique human-readable request identifier (e.g., REQ-2025-001)'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Patient full name'
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Patient phone number in Thai format'
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true
            },
            comment: 'Patient email address'
        },
        preferredDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'preferred_date',
            comment: 'Preferred appointment date'
        },
        preferredTime: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'preferred_time',
            comment: 'Preferred appointment time slot'
        },
        serviceType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'service_type',
            comment: 'Type of dental service requested'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional notes from patient'
        },
        status: {
            type: DataTypes.ENUM('pending', 'contacted', 'confirmed', 'cancelled', 'completed'),
            allowNull: false,
            defaultValue: 'pending',
            comment: 'Current status of the appointment request'
        },
        emailSent: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'email_sent',
            comment: 'Whether admin notification email was sent'
        },
        smsSent: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'sms_sent',
            comment: 'Whether patient confirmation SMS was sent'
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
            field: 'ip_address',
            comment: 'IP address of the requester'
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'user_agent',
            comment: 'Browser user agent string'
        },
        appointmentId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'appointment_id',
            references: {
                model: 'appointments',
                key: 'id'
            },
            comment: 'Link to the created appointment when confirmed'
        }
    }, {
        tableName: 'appointment_requests',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['request_id'],
                unique: true
            },
            {
                fields: ['email']
            },
            {
                fields: ['phone']
            },
            {
                fields: ['status']
            },
            {
                fields: ['preferred_date']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    /**
     * Generate a unique request ID
     * Format: REQ-YYYY-XXXXX (e.g., REQ-2025-00001)
     */
    AppointmentRequest.generateRequestId = async function () {
        const year = new Date().getFullYear();
        const prefix = `REQ-${year}-`;

        // Get the latest request ID for this year
        const latestRequest = await this.findOne({
            where: {
                requestId: {
                    [sequelize.Sequelize.Op.like]: `${prefix}%`
                }
            },
            order: [['id', 'DESC']]
        });

        let nextNumber = 1;
        if (latestRequest) {
            const lastNumber = parseInt(latestRequest.requestId.split('-')[2], 10);
            nextNumber = lastNumber + 1;
        }

        return `${prefix}${String(nextNumber).padStart(5, '0')}`;
    };

    /**
     * Associations
     */
    AppointmentRequest.associate = function (models) {
        AppointmentRequest.belongsTo(models.Appointment, {
            foreignKey: 'appointmentId',
            as: 'appointment'
        });
    };

    return AppointmentRequest;
};
