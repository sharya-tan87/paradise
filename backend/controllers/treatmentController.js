const { Treatment, User, Patient, Appointment, Invoice } = require('../models');
const { Op } = require('sequelize');

exports.getTreatments = async (req, res) => {
    try {
        const { patientHN, excludeInvoiced } = req.query;
        const whereClause = {};

        if (patientHN) {
            whereClause.patientHN = patientHN;
        }

        if (excludeInvoiced === 'true' && patientHN) {
            // Find all invoices for this patient to filter out already invoiced treatments
            const invoices = await Invoice.findAll({
                where: { patientHN },
                attributes: ['lineItems']
            });

            // Extract all treatment IDs that have been invoiced
            const invoicedTreatmentIds = invoices.reduce((acc, invoice) => {
                if (Array.isArray(invoice.lineItems)) {
                    invoice.lineItems.forEach(item => {
                        if (item.treatmentId) {
                            acc.push(item.treatmentId);
                        }
                    });
                }
                return acc;
            }, []);

            if (invoicedTreatmentIds.length > 0) {
                whereClause.id = { [Op.notIn]: invoicedTreatmentIds };
            }
        }

        const treatments = await Treatment.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'dentist',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['treatmentDate', 'DESC'], ['created_at', 'DESC']]
        });

        res.json(treatments);
    } catch (error) {
        console.error('Error fetching treatments:', error);
        res.status(500).json({ message: 'Failed to fetch treatments' });
    }
};

exports.getTreatmentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const treatment = await Treatment.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'dentist',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['firstName', 'lastName', 'hn']
                }
            ]
        });

        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        res.json(treatment);
    } catch (error) {
        console.error('Error fetching treatment details:', error);
        res.status(500).json({ message: 'Failed to fetch treatment details' });
    }
};

exports.createTreatment = async (req, res) => {
    try {
        const {
            patientHN,
            appointmentId,
            treatmentDate,
            procedureCodes,
            description,
            toothNumbers,
            performedBy,
            clinicalNotes,
            estimatedCost,
            status
        } = req.body;

        console.log('Creating treatment for patient:', patientHN, 'by user:', req.user.userId);

        // Validation - ensure patient exists
        const patient = await Patient.findOne({ where: { hn: patientHN } });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Validate performedBy (optional check)
        // If performedBy is provided (e.g. by admin selecting a dentist), check if that user exists
        let dentistId = performedBy || req.user.userId;

        // Ensure dentistId is valid
        const dentist = await User.findByPk(dentistId);
        if (!dentist) {
            return res.status(400).json({ message: 'Invalid dentist/user ID for performedBy field' });
        }

        const treatmentData = {
            patientHN,
            appointmentId: appointmentId || null,
            treatmentDate,
            procedureCodes: procedureCodes || [],
            description,
            toothNumbers: toothNumbers || [],
            performedBy: dentistId,
            clinicalNotes,
            estimatedCost: estimatedCost || 0,
            status: status || 'planned'
        };

        const treatment = await Treatment.create(treatmentData);
        res.status(201).json(treatment);
    } catch (error) {
        console.error('Error creating treatment:', error);
        res.status(500).json({
            message: 'Failed to create treatment',
            details: error.message
        });
    }
};

exports.updateTreatment = async (req, res) => {
    try {
        const { id } = req.params;
        const treatment = await Treatment.findByPk(id);

        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        // Permission check: Admin or Creator (Dentist)
        const isCreator = req.user.userId === treatment.performedBy;
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to edit this treatment' });
        }

        const {
            treatmentDate,
            procedureCodes,
            description,
            toothNumbers,
            performedBy,
            clinicalNotes,
            estimatedCost,
            status
        } = req.body;

        await treatment.update({
            treatmentDate,
            procedureCodes,
            description,
            toothNumbers,
            performedBy,
            clinicalNotes,
            estimatedCost,
            status
        });

        res.json(treatment);
    } catch (error) {
        console.error('Error updating treatment:', error);
        res.status(500).json({ message: 'Failed to update treatment' });
    }
};
