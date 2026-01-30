'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
        static associate(models) {
            // Service can be linked to DentistProfiles through DentistServices
            Service.belongsToMany(models.DentistProfile, {
                through: 'DentistServices',
                foreignKey: 'serviceId',
                otherKey: 'dentistProfileId',
                as: 'dentists'
            });
        }
    }

    Service.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        nameTh: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        descriptionTh: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM('general', 'cosmetic', 'orthodontics', 'surgical', 'preventive', 'restorative', 'pediatric'),
            allowNull: false,
            defaultValue: 'general'
        },
        basePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER, // Duration in minutes
            allowNull: true,
            defaultValue: 30
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'Service',
        tableName: 'services',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Service;
};
