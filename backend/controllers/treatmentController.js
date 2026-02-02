const { Treatment, User, Patient, Appointment, Invoice } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

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
        logger.error('Error fetching treatments', { error: error.message });
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
        logger.error('Error fetching treatment details', { id: req.params.id, error: error.message });
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

        // Log without exposing PHI (patient HN is internal identifier, acceptable for audit)
        logger.info('Treatment creation initiated', {
            userId: req.user.userId,
            patientHN: patientHN  // HN is internal ID, not PHI
        });

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

        logger.info('Treatment created', {
            treatmentId: treatment.id,
            patientHN: patientHN,
            performedBy: dentistId
        });

        res.status(201).json(treatment);
    } catch (error) {
        logger.error('Error creating treatment', { error: error.message });
        res.status(500).json({
            message: 'Failed to create treatment',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        // Permission check: Admin, Manager, or Creator (Dentist who performed the treatment)
        const isCreator = req.user.userId === treatment.performedBy;
        const isAdmin = req.user.role === 'admin';
        const isManager = req.user.role === 'manager';

        // SECURITY FIX: Only admin, manager, or the treating dentist can modify
        if (!isCreator && !isAdmin && !isManager) {
            logger.warn('Unauthorized treatment update attempt', {
                userId: req.user.userId,
                userRole: req.user.role,
                treatmentId: id,
                originalPerformedBy: treatment.performedBy
            });
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

        logger.info('Treatment updated', {
            treatmentId: id,
            updatedBy: req.user.userId
        });

        res.json(treatment);
    } catch (error) {
        logger.error('Error updating treatment', { id: req.params.id, error: error.message });
        res.status(500).json({ message: 'Failed to update treatment' });
    }
};
