'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class InventoryItem extends Model {
        static associate(models) {
            // associations can be defined here
        }
    }
    InventoryItem.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        reorderLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10
        },
        unitCost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        supplier: {
            type: DataTypes.STRING,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'InventoryItem',
        tableName: 'InventoryItems',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    return InventoryItem;
};
