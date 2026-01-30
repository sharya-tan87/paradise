const { body, validationResult } = require('express-validator');

// Phone validation: Accept 10-digit Thai phone numbers with or without dashes
// Examples: 0812345678, 081-234-5678, 02-1234-5678, 095-259-7922
const phoneRegex = /^0[0-9]{9}$|^0[2-9]-[0-9]{4}-[0-9]{4}$|^0[0-9]{2}-[0-9]{3}-[0-9]{4}$/;

// Service types allowed
const allowedServiceTypes = [
    'General Checkup',
    'Teeth Cleaning',
    'Cosmetic Dentistry',
    'Orthodontics',
    'Dental Implants',
    'Other'
];

/**
 * Validation rules for appointment request
 */
const appointmentValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(phoneRegex)
        .withMessage('Phone must be 10 digits starting with 0 (e.g., 0812345678 or 081-234-5678)'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),

    body('preferredDate')
        .notEmpty().withMessage('Preferred date is required')
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (date < today) {
                throw new Error('Date must be in the future');
            }

            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

            if (date > sixMonthsFromNow) {
                throw new Error('Date must be within 6 months');
            }

            return true;
        }),

    body('preferredTime')
        .notEmpty().withMessage('Preferred time is required'),

    body('serviceType')
        .notEmpty().withMessage('Service type is required')
        .isIn(allowedServiceTypes)
        .withMessage('Invalid service type'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

/**
 * Middleware to validate appointment request
 */
const validateAppointmentRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }

    next();
};

module.exports = {
    appointmentValidationRules,
    validateAppointmentRequest
};
