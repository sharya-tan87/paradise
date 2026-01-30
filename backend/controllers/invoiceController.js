const { Invoice, Patient, Treatment, User } = require('../models');
const { Op } = require('sequelize');

exports.listInvoices = async (req, res) => {
    try {
        const { status, patientHN, startDate, endDate, search } = req.query;
        const whereClause = {};

        if (status && status !== 'all') {
            whereClause.paymentStatus = status;
        }

        if (patientHN) {
            whereClause.patientHN = patientHN;
        }

        if (startDate && endDate) {
            whereClause.invoiceDate = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            whereClause.invoiceDate = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            whereClause.invoiceDate = {
                [Op.lte]: endDate
            };
        }

        const invoices = await Invoice.findAll({
            where: whereClause,
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['firstName', 'lastName', 'hn', 'phone'],
                    where: search ? {
                        [Op.or]: [
                            { firstName: { [Op.like]: `%${search}%` } },
                            { lastName: { [Op.like]: `%${search}%` } },
                            { hn: { [Op.like]: `%${search}%` } }
                        ]
                    } : undefined,
                    required: !!search
                }
            ],
            order: [['invoiceDate', 'DESC'], ['created_at', 'DESC']]
        });

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

exports.getInvoice = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const invoice = await Invoice.findOne({
            where: { invoiceNumber },
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['firstName', 'lastName', 'hn', 'phone', 'email', 'address']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['firstName', 'lastName']
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
};

exports.createInvoice = async (req, res) => {
    try {
        const { patientHN, treatmentIds, dueDate, discount, vatIncluded } = req.body;

        // Verify patient exists
        const patient = await Patient.findOne({ where: { hn: patientHN } });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Fetch selected treatments
        const treatments = await Treatment.findAll({
            where: {
                id: { [Op.in]: treatmentIds },
                patientHN: patientHN
            }
        });

        if (treatments.length === 0) {
            return res.status(400).json({ error: 'No valid treatments selected' });
        }

        // Build line items
        const lineItems = treatments.map(t => ({
            treatmentId: t.id,
            description: t.description || t.procedureCodes?.join(', ') || 'Treatment',
            date: t.treatmentDate,
            cost: parseFloat(t.estimatedCost) || 0
        }));

        // Calculate totals
        const subtotal = lineItems.reduce((sum, item) => sum + item.cost, 0);
        const discountAmount = parseFloat(discount) || 0;
        const afterDiscount = Math.max(0, subtotal - discountAmount);

        const isVatIncluded = vatIncluded !== undefined ? vatIncluded : true;
        const taxAmount = isVatIncluded ? afterDiscount * 0.07 : 0;

        const totalAmount = afterDiscount + taxAmount;

        // Generate invoice number
        const invoiceNumber = await Invoice.generateInvoiceNumber();

        // Create invoice
        const invoice = await Invoice.create({
            invoiceNumber,
            patientHN,
            invoiceDate: new Date(),
            dueDate: dueDate || null,
            lineItems,
            subtotal,
            discount: discountAmount,
            vatIncluded: isVatIncluded,
            taxAmount,
            totalAmount,
            paymentStatus: 'unpaid',
            createdBy: req.user.userId
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

exports.recordPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentDate, paymentMethod, amountPaid } = req.body;

        const invoice = await Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const total = parseFloat(invoice.totalAmount);
        const paid = parseFloat(amountPaid) || 0;

        let paymentStatus = 'unpaid';
        if (paid >= total) {
            paymentStatus = 'paid';
        } else if (paid > 0) {
            paymentStatus = 'partially-paid';
        }

        await invoice.update({
            paymentStatus,
            paymentDate: paymentDate || new Date(),
            paymentMethod: paymentMethod || null
        });

        res.json(invoice);
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};
