'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DentistProfile extends Model {
        static associate(models) {
            // DentistProfile belongs to a User
            DentistProfile.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });

            // DentistProfile can have many Services
            DentistProfile.belongsToMany(models.Service, {
                through: 'DentistServices',
                foreignKey: 'dentistProfileId',
                otherKey: 'serviceId',
                as: 'services'
            });
        }
    }

    DentistProfile.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        licenseNumber: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        specializations: {
            type: DataTypes.JSON, // Array of specialization strings
            allowNull: true,
            defaultValue: []
        },
        certificates: {
            type: DataTypes.JSON, // Array of certificate objects {name, issuedBy, issuedDate, expiryDate}
            allowNull: true,
            defaultValue: []
        },
        education: {
            type: DataTypes.JSON, // Array of education objects {degree, institution, year}
            allowNull: true,
            defaultValue: []
        },
        experience: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        bioTh: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        consultationFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        availableDays: {
            type: DataTypes.JSON, // Array of day numbers [1,2,3,4,5] for Mon-Fri
            allowNull: true,
            defaultValue: [1, 2, 3, 4, 5]
        },
        workingHours: {
            type: DataTypes.JSON, // {start: "09:00", end: "17:00"}
            allowNull: true,
            defaultValue: { start: "09:00", end: "17:00" }
        }
    }, {
        sequelize,
        modelName: 'DentistProfile',
        tableName: 'dentist_profiles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return DentistProfile;
};
