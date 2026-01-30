const { Model, DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
    class Invoice extends Model {
        static associate(models) {
            Invoice.belongsTo(models.Patient, { foreignKey: 'patientHN', targetKey: 'hn', as: 'patient' });
            Invoice.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
        }

        static async generateInvoiceNumber() {
            const year = new Date().getFullYear();
            const lastInvoice = await Invoice.findOne({
                where: { invoiceNumber: { [Op.like]: `INV-${year}-%` } },
                order: [['created_at', 'DESC']]
            });

            let nextNum = 1;
            if (lastInvoice && lastInvoice.invoiceNumber) {
                const parts = lastInvoice.invoiceNumber.split('-');
                if (parts.length === 3) {
                    const lastNum = parseInt(parts[2], 10);
                    if (!isNaN(lastNum)) {
                        nextNum = lastNum + 1;
                    }
                }
            }

            return `INV-${year}-${String(nextNum).padStart(5, '0')}`;
        }
    }

    Invoice.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        invoiceNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        patientHN: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'patients',
                key: 'hn'
            }
        },
        invoiceDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        lineItems: {
            type: DataTypes.JSON, // [{ treatmentId, description, cost, date }]
            allowNull: false,
            defaultValue: []
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        vatIncluded: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        taxAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        paymentStatus: {
            type: DataTypes.ENUM('unpaid', 'partially-paid', 'paid'),
            defaultValue: 'unpaid'
        },
        paymentDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        paymentMethod: {
            type: DataTypes.STRING(50), // 'cash', 'credit', 'transfer'
            allowNull: true
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false, // Invoices should be tracked
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Invoice',
        tableName: 'invoices',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Invoice;
};
