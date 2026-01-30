const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Treatment extends Model {
        static associate(models) {
            Treatment.belongsTo(models.Patient, { foreignKey: 'patientHN', targetKey: 'hn', as: 'patient' });
            Treatment.belongsTo(models.Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
            Treatment.belongsTo(models.User, { foreignKey: 'performedBy', as: 'dentist' });
        }
    }

    Treatment.init({
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
        appointmentId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'appointments',
                key: 'id'
            }
        },
        treatmentDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        procedureCodes: {
            type: DataTypes.JSON, // JSON array of strings e.g. ['D0120', 'D1110']
            allowNull: false,
            defaultValue: []
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        toothNumbers: {
            type: DataTypes.JSON, // JSON array of numbers/strings e.g. [14, 15] or ['14', '15']
            allowNull: true,
            defaultValue: []
        },
        performedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        clinicalNotes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        estimatedCost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        status: {
            type: DataTypes.ENUM('planned', 'in-progress', 'completed'),
            defaultValue: 'planned'
        }
    }, {
        sequelize,
        modelName: 'Treatment',
        tableName: 'treatments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Treatment;
};
