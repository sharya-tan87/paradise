/**
 * Appointment Controller
 * Handles appointment request creation and notification sending
 */
const { AppointmentRequest, Patient, Appointment } = require('../models');
const { sendAppointmentNotificationEmail } = require('../services/emailService');
const { sendAppointmentConfirmationSMS } = require('../services/smsService');
const logger = require('../utils/logger');
const Joi = require('joi');

// Validation schema for appointment request
const appointmentRequestSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
            'any.required': 'Full name is required'
        }),
    phone: Joi.string()
        .pattern(/^0[0-9]{9}$|^0[2-9]-[0-9]{4}-[0-9]{4}$|^0[0-9]{2}-[0-9]{3}-[0-9]{4}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid phone format (e.g., 0812345678 or 081-234-5678)',
            'any.required': 'Phone number is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email address is required'
        }),
    preferredDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Date must be in YYYY-MM-DD format',
            'any.required': 'Preferred date is required'
        }),
    preferredTime: Joi.string()
        .required()
        .messages({
            'any.required': 'Preferred time is required'
        }),
    serviceType: Joi.string()
        .valid('General Checkup', 'Teeth Cleaning', 'Cosmetic Dentistry', 'Orthodontics', 'Dental Implants', 'Other')
        .required()
        .messages({
            'any.only': 'Please select a valid service type',
            'any.required': 'Service type is required'
        }),
    notes: Joi.string()
        .max(500)
        .allow('', null)
        .messages({
            'string.max': 'Notes cannot exceed 500 characters'
        })
});

/**
 * Send notifications asynchronously (non-blocking)
 * @param {Object} appointmentData - Appointment data including requestId
 */
const sendNotifications = async (appointmentData) => {
    const results = await Promise.allSettled([
        sendAppointmentNotificationEmail(appointmentData),
        sendAppointmentConfirmationSMS(appointmentData)
    ]);

    // Update database with notification status
    try {
        const emailSuccess = results[0].status === 'fulfilled' && results[0].value === true;
        const smsSuccess = results[1].status === 'fulfilled' && results[1].value === true;

        await AppointmentRequest.update(
            {
                emailSent: emailSuccess,
                smsSent: smsSuccess
            },
            {
                where: { requestId: appointmentData.requestId }
            }
        );

        logger.info('Notification status updated', {
            requestId: appointmentData.requestId,
            emailSent: emailSuccess,
            smsSent: smsSuccess
        });
    } catch (error) {
        logger.error('Failed to update notification status', {
            requestId: appointmentData.requestId,
            error: error.message
        });
    }
};

/**
 * Create a new appointment request
 * POST /api/appointments/request
 */
const createAppointmentRequest = async (req, res) => {
    try {
        // Validation is handled by middleware (express-validator)
        // Data is already validated and sanitized
        const value = req.body;

        // Generate unique request ID
        const requestId = await AppointmentRequest.generateRequestId();

        // Create appointment request in database
        const appointment = await AppointmentRequest.create({
            requestId,
            name: value.name,
            phone: value.phone,
            email: value.email,
            preferredDate: value.preferredDate,
            preferredTime: value.preferredTime,
            serviceType: value.serviceType,
            notes: value.notes || null,
            status: 'pending',
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        logger.info('Appointment request created', {
            requestId,
            email: value.email,
            phone: value.phone,
            serviceType: value.serviceType
        });

        // Prepare appointment data for notifications
        const appointmentData = {
            requestId,
            name: value.name,
            phone: value.phone,
            email: value.email,
            preferredDate: value.preferredDate,
            preferredTime: value.preferredTime,
            serviceType: value.serviceType,
            notes: value.notes
        };

        // Send notifications asynchronously (don't await - non-blocking)
        sendNotifications(appointmentData).catch(err => {
            logger.error('Notification sending failed', {
                requestId,
                error: err.message
            });
        });

        // Return success immediately
        return res.status(201).json({
            success: true,
            requestId,
            message: 'Appointment request received successfully. We will contact you within 24 hours to confirm.'
        });

    } catch (error) {
        logger.error('Failed to create appointment request', {
            error: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request. Please try again later.'
        });
    }
};

/**
 * Get appointment request by ID (for admin)
 * GET /api/appointments/:requestId
 */
const getAppointmentRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const appointment = await AppointmentRequest.findOne({
            where: { requestId }
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment request not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        logger.error('Failed to get appointment request', {
            requestId: req.params.requestId,
            error: error.message
        });

        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the appointment request'
        });
    }
};

/**
 * List all appointment requests (for admin)
 * GET /api/appointments
 */
const listAppointmentRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const { count, rows } = await AppointmentRequest.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [{
                model: Appointment,
                as: 'appointment',
                required: false,
                include: [{
                    model: require('../models').User,
                    as: 'dentist',
                    attributes: ['id', 'username', 'email']
                }]
            }]
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
        logger.error('Failed to list appointment requests', {
            error: error.message
        });

        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching appointment requests'
        });
    }
};


/**
 * Update appointment request status (for admin)
 * PATCH /api/appointments/:requestId/status
 */
const updateAppointmentStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, patientDetails, appointmentDetails, patientHN: providedPatientHN } = req.body;

        const validStatuses = ['pending', 'contacted', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const appointmentRequest = await AppointmentRequest.findOne({ where: { requestId } });

        if (!appointmentRequest) {
            return res.status(404).json({
                success: false,
                message: 'Appointment request not found'
            });
        }

        let patientHN = null;

        // Handle patient creation/linking when confirming
        if (status === 'confirmed' && appointmentRequest.status !== 'confirmed') {

            // If patientHN is provided directly from frontend, use it
            if (providedPatientHN) {
                const existingPatient = await Patient.findOne({
                    where: { hn: providedPatientHN }
                });

                if (existingPatient) {
                    patientHN = existingPatient.hn;
                    logger.info('Using provided patient HN', { patientHN, requestId });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Provided patient HN not found in system'
                    });
                }
            } else {
                // Fallback: Check if patient exists by phone
                let existingPatient = await Patient.findOne({
                    where: { phone: appointmentRequest.phone }
                });

                if (!existingPatient) {
                    // If patient details are not provided, request them
                    if (!patientDetails) {
                        return res.status(400).json({
                            success: false,
                            code: 'PATIENT_REQUIRED',
                            message: 'Patient record not found. Please provide details to create a new patient.'
                        });
                    }

                    // Create new patient
                    try {
                        let { firstName, lastName } = patientDetails;
                        if (!firstName || !lastName) {
                            const nameParts = appointmentRequest.name.split(' ');
                            firstName = nameParts[0];
                            lastName = nameParts.slice(1).join(' ') || '-';
                        }

                        const hn = await Patient.generateHN();
                        existingPatient = await Patient.create({
                            hn,
                            title: patientDetails.title || 'Mr.',
                            firstName: firstName,
                            lastName: lastName,
                            dateOfBirth: patientDetails.dateOfBirth,
                            gender: patientDetails.gender,
                            phone: appointmentRequest.phone,
                            email: appointmentRequest.email,
                            active: true
                        });

                        logger.info('New patient created from appointment request', { hn, requestId });

                    } catch (err) {
                        logger.error('Failed to create patient from request', { error: err.message });
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create patient record: ' + err.message
                        });
                    }
                }

                patientHN = existingPatient.hn;
            }

            // Now create the actual appointment in the calendar
            try {
                // Parse time from preferredTime (e.g., "09:00 AM" or "2:30 PM" or "14:00")
                let startTime = '09:00';
                let endTime = '10:00';

                if (appointmentRequest.preferredTime) {
                    const timeStr = appointmentRequest.preferredTime.trim();
                    // Handle different time formats
                    if (timeStr.includes('AM') || timeStr.includes('PM')) {
                        // 12-hour format: "9:00 AM" or "2:30 PM"
                        const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        if (match) {
                            let hours = parseInt(match[1], 10);
                            const minutes = match[2];
                            const period = match[3].toUpperCase();

                            if (period === 'PM' && hours !== 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;

                            startTime = `${String(hours).padStart(2, '0')}:${minutes}`;
                            // Default 1 hour appointment
                            const endHour = hours + 1;
                            endTime = `${String(endHour).padStart(2, '0')}:${minutes}`;
                        }
                    } else if (timeStr.includes(':')) {
                        // 24-hour format: "09:00" or "14:30"
                        startTime = timeStr.substring(0, 5);
                        const [h, m] = startTime.split(':').map(Number);
                        const endHour = h + 1;
                        endTime = `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    }
                }

                // Override with appointmentDetails if provided
                if (appointmentDetails) {
                    if (appointmentDetails.startTime) startTime = appointmentDetails.startTime;
                    if (appointmentDetails.endTime) endTime = appointmentDetails.endTime;
                }

                const appointmentData = {
                    patientHN: patientHN,
                    appointmentDate: appointmentRequest.preferredDate,
                    startTime: startTime,
                    endTime: endTime,
                    serviceType: appointmentRequest.serviceType,
                    status: 'scheduled',
                    dentistId: appointmentDetails?.dentistId || null,
                    notes: appointmentRequest.notes || `Created from request ${requestId}`,
                    createdBy: req.user ? req.user.id : null
                };

                const newAppointment = await Appointment.create(appointmentData);

                // Save the appointmentId to the request for linking
                await AppointmentRequest.update(
                    { appointmentId: newAppointment.id },
                    { where: { requestId } }
                );

                logger.info('Appointment created from request', {
                    appointmentId: newAppointment.id,
                    requestId,
                    patientHN
                });

            } catch (err) {
                logger.error('Failed to create appointment from request', {
                    requestId,
                    error: err.message,
                    stack: err.stack
                });
                // Don't fail the whole operation, just log the error
                // The status will still be updated
            }
        }

        const [updatedCount] = await AppointmentRequest.update(
            { status },
            { where: { requestId } }
        );

        if (updatedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment request not found'
            });
        }

        logger.info('Appointment status updated', { requestId, status });

        return res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            appointmentCreated: status === 'confirmed' && appointmentRequest.status !== 'confirmed'
        });

    } catch (error) {
        logger.error('Failed to update appointment status', {
            requestId: req.params.requestId,
            error: error.message
        });

        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating the appointment status'
        });
    }
};


module.exports = {
    createAppointmentRequest,
    getAppointmentRequest,
    listAppointmentRequests,
    updateAppointmentStatus
};
