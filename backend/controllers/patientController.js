const { Patient, Sequelize } = require('../models');
const { Op } = Sequelize;
const logger = require('../utils/logger');
const Joi = require('joi');

const patientSchema = Joi.object({
    title: Joi.string().valid('Mr.', 'Ms.', 'Mrs.', 'Dr.').required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().iso().less('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    phone: Joi.string().pattern(/^0[2-9]-?[0-9]{3,4}-?[0-9]{4}$/).required(),
    email: Joi.string().email().allow(null, ''),
    address: Joi.string().allow(null, ''),
    emergencyContactName: Joi.string().allow(null, ''),
    emergencyContactPhone: Joi.string().allow(null, ''),
    dentalComplaint: Joi.string().allow(null, ''),
    lastDentalVisit: Joi.string().allow(null, ''),
    medicalHistory: Joi.string().allow(null, ''),
    allergies: Joi.string().allow(null, ''),
    currentMedications: Joi.string().allow(null, '')
});

const createPatient = async (req, res) => {
    try {
        const { error, value } = patientSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Generate HN
        const hn = await Patient.generateHN();

        const patient = await Patient.create({
            ...value,
            hn
        });

        logger.info('Patient created', { hn: patient.hn });

        return res.status(201).json({
            success: true,
            data: patient
        });
    } catch (error) {
        logger.error('Failed to create patient', { error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to create patient record'
        });
    }
};

const listPatients = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { active: true };

        if (search) {
            whereClause[Op.or] = [
                { hn: { [Op.like]: `%${search}%` } },
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Patient.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        logger.error('Failed to list patients', { error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch patients list'
        });
    }
};

const getPatient = async (req, res) => {
    try {
        const { hn } = req.params;
        const patient = await Patient.findOne({
            where: { hn, active: true }
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        logger.error('Failed to get patient', { hn: req.params.hn, error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch patient details'
        });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { hn } = req.params;
        const { error, value } = patientSchema.validate(req.body, { allowUnknown: true });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const [updated] = await Patient.update(value, {
            where: { hn, active: true }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Fetch updated patient
        const patient = await Patient.findOne({ where: { hn } });

        logger.info('Patient updated', { hn });

        return res.status(200).json({
            success: true,
            data: patient,
            message: 'Patient record updated successfully'
        });
    } catch (error) {
        logger.error('Failed to update patient', { hn: req.params.hn, error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to update patient record'
        });
    }
};

const deletePatient = async (req, res) => {
    try {
        const { hn } = req.params;
        const [updated] = await Patient.update({ active: false }, {
            where: { hn, active: true }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        logger.info('Patient deactivated', { hn });

        return res.status(200).json({
            success: true,
            message: 'Patient record deactivated successfully'
        });
    } catch (error) {
        logger.error('Failed to delete patient', { hn: req.params.hn, error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to delete patient record'
        });
    }
};

module.exports = {
    createPatient,
    listPatients,
    getPatient,
    updatePatient,
    deletePatient
};
