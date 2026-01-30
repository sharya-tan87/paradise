const { Model, DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
    class Patient extends Model {
        static async generateHN() {
            // Find the last patient with HN starting with "HN-"
            // We need to look for patterns like "HN-XXXXX" 
            // Note: Since we are changing formats, we should handle legacy formats gracefully or just look for the highest number if possible.
            // For simplicity and per request, we will transition to HN-XXXXX.
            // We search for any HN- (assuming we want to increment from the global max or just start new scheme).
            // If the user wants to keep unique across all time, we should check max of all.
            // Let's assume we want to continue the sequence but in new format.
            // Actually, if we change format, the sort might be tricky if mixing HN-2025-00001 and HN-00002.
            // HN-2025... vs HN-00002... Alphabetically HN-0 comes before HN-2.

            // Let's find the last created patient to determine the next ID, but we need to parse carefully.
            const lastPatient = await Patient.findOne({
                where: {
                    hn: { [Op.like]: 'HN-%' }
                },
                order: [['created_at', 'DESC']]
            });

            let nextNum = 1;
            if (lastPatient && lastPatient.hn) {
                const parts = lastPatient.hn.split('-');
                // Check format: HN-YYYY-XXXXX (old) or HN-XXXXX (new)
                if (parts.length === 3) {
                    // Old format: HN-YYYY-XXXXX -> parts[2] is the number
                    const lastNum = parseInt(parts[2], 10);
                    if (!isNaN(lastNum)) {
                        nextNum = lastNum + 1;
                    }
                } else if (parts.length === 2) {
                    // New format: HN-XXXXX -> parts[1] is the number
                    const lastNum = parseInt(parts[1], 10);
                    if (!isNaN(lastNum)) {
                        nextNum = lastNum + 1;
                    }
                }
            }

            return `HN-${String(nextNum).padStart(5, '0')}`;
        }

        static associate(models) {
            // Future associations can be defined here
        }
    }

    Patient.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        hn: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        title: {
            type: DataTypes.ENUM('Mr.', 'Ms.', 'Mrs.', 'Dr.'),
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        emergencyContactName: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        emergencyContactPhone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        dentalComplaint: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        lastDentalVisit: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        medicalHistory: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        allergies: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        currentMedications: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Patient',
        tableName: 'patients',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Patient;
};
