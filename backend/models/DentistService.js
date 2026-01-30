'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DentistService extends Model {
        static associate(models) {
            // This is a junction table, associations are defined in DentistProfile and Service
        }
    }

    DentistService.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        dentistProfileId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'dentist_profiles',
                key: 'id'
            }
        },
        serviceId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'services',
                key: 'id'
            }
        },
        customPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true // If null, use service's base price
        }
    }, {
        sequelize,
        modelName: 'DentistService',
        tableName: 'dentist_services',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['dentistProfileId', 'serviceId']
            }
        ]
    });

    return DentistService;
};
