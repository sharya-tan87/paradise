const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Appointment extends Model {
        static associate(models) {
            // Define associations here
            Appointment.belongsTo(models.Patient, { foreignKey: 'patientHN', targetKey: 'hn', as: 'patient' });
            Appointment.belongsTo(models.User, { foreignKey: 'dentistId', as: 'dentist' });
        }
    }

    Appointment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        patientHN: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'patients',
                key: 'hn'
            }
        },
        appointmentDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false
        },
        serviceType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
            defaultValue: 'scheduled'
        },
        dentistId: {
            type: DataTypes.UUID,
            allowNull: true, // Can be assigned later or if clinic has generic pool
            references: {
                model: 'users',
                key: 'id'
            }
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: true
        },
        updatedBy: {
            type: DataTypes.UUID,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Appointment',
        tableName: 'appointments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Appointment;
};
