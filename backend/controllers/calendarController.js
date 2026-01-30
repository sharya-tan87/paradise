const { Appointment, Patient, User, Sequelize } = require('../models');
const { Op } = Sequelize;
const logger = require('../utils/logger');
const Joi = require('joi');

const appointmentSchema = Joi.object({
    patientHN: Joi.string().required(),
    appointmentDate: Joi.date().iso().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    serviceType: Joi.string().required(),
    dentistId: Joi.string().uuid().allow(null, ''),
    notes: Joi.string().allow(null, ''),
    status: Joi.string().valid('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')
});

// Schema for partial updates (drag-and-drop, status changes, etc.)
const updateAppointmentSchema = Joi.object({
    patientHN: Joi.string(),
    appointmentDate: Joi.date().iso(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    serviceType: Joi.string(),
    dentistId: Joi.string().uuid().allow(null, ''),
    notes: Joi.string().allow(null, ''),
    status: Joi.string().valid('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')
}).min(1); // At least one field must be provided

const getCalendarAppointments = async (req, res) => {
    try {
        const { start, end, dentistId } = req.query;

        const whereClause = {
            active: true,
            appointmentDate: {
                [Op.between]: [start, end]
            }
        };

        if (dentistId) {
            whereClause.dentistId = dentistId;
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['hn', 'firstName', 'lastName', 'phone']
                },
                {
                    model: User,
                    as: 'dentist',
                    attributes: ['id', 'username', 'email'] // Assuming User model has these
                }
            ]
        });

        // Transform for frontend if needed, but returning raw is usually fine.
        // Frontend expects: id, title, start, end, etc.
        // We will send raw data and let f/e transform, or transform here?
        // AC 5 says "Transform appointment data to FullCalendar event format" - this suggests F/E task.
        // AC 8 says "API endpoints: GET /api/appointments/calendar"

        return res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (error) {
        logger.error('Failed to get calendar appointments', { error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments'
        });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { error, value } = appointmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Check for overlaps (basic check) - Optional but good practice
        // "no overlapping appointments" is in Task 6 (Validation) but good to enforce in backend too.
        // For now, let's keep it simple as per story spec, maybe add later if strict.

        // Ensure patient exists
        const patient = await Patient.findOne({ where: { hn: value.patientHN } });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const appointment = await Appointment.create({
            ...value,
            createdBy: req.user ? req.user.id : null
        });

        logger.info('Appointment created', { id: appointment.id, hn: value.patientHN });

        return res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        logger.error('Failed to create appointment', { error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to create appointment'
        });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateAppointmentSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const [updated] = await Appointment.update({
            ...value,
            updatedBy: req.user ? req.user.id : null
        }, {
            where: { id, active: true }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        const appointment = await Appointment.findByPk(id, {
            include: ['patient', 'dentist']
        });

        logger.info('Appointment updated', { id });

        return res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        logger.error('Failed to update appointment', { id: req.params.id, error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to update appointment'
        });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Appointment.update({ active: false }, {
            where: { id, active: true }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        logger.info('Appointment deleted (soft)', { id });

        return res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        logger.error('Failed to delete appointment', { id: req.params.id, error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to delete appointment'
        });
    }
};

module.exports = {
    getCalendarAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
};
