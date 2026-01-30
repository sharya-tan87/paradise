/**
 * SMS Service
 * Handles sending SMS notifications using Twilio
 */
const logger = require('../utils/logger');

let twilioClient = null;

/**
 * Initialize the Twilio client
 * Creates a Twilio client instance with credentials from environment variables
 */
const initializeTwilioClient = () => {
    if (twilioClient) return twilioClient;

    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        logger.warn('SMS service not configured - Twilio credentials missing');
        return null;
    }

    try {
        const twilio = require('twilio');
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        return twilioClient;
    } catch (error) {
        logger.error('Failed to initialize Twilio client', { error: error.message });
        return null;
    }
};

/**
 * Format Thai phone number to E.164 format
 * @param {string} phone - Phone number in Thai format (e.g., 081-234-5678 or 02-123-4567)
 * @returns {string} Phone number in E.164 format (e.g., +66812345678)
 */
const formatPhoneToE164 = (phone) => {
    if (!phone) return null;

    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');

    // If it already starts with 66, add + prefix
    if (digits.startsWith('66')) {
        return `+${digits}`;
    }

    // If it starts with 0, replace with +66
    if (digits.startsWith('0')) {
        return `+66${digits.substring(1)}`;
    }

    // If it's already in correct format without +
    return `+66${digits}`;
};

/**
 * Generate SMS message for appointment confirmation
 * Message must be 160 characters or less
 * @param {string} requestId - Unique request identifier
 * @returns {string} SMS message body
 */
const generateAppointmentConfirmationMessage = (requestId) => {
    // Primary message (118 characters)
    const message = `Thank you for your appointment request at Paradise Dental! We'll contact you within 24 hours to confirm. Ref: ${requestId}`;

    // If message exceeds 160 characters, use shorter version
    if (message.length > 160) {
        return `Paradise Dental received your appointment request. We'll call you soon. Ref: ${requestId}`;
    }

    return message;
};

/**
 * Send appointment confirmation SMS to patient
 * @param {Object} appointmentData - Appointment request data
 * @param {string} appointmentData.requestId - Unique request identifier
 * @param {string} appointmentData.phone - Patient's phone number
 * @param {string} appointmentData.name - Patient's name (for logging)
 * @returns {Promise<boolean>} Success status
 */
const sendAppointmentConfirmationSMS = async (appointmentData) => {
    const client = initializeTwilioClient();

    if (!client) {
        logger.logNotification('sms', false, {
            requestId: appointmentData.requestId,
            reason: 'SMS service not configured'
        });
        return false;
    }

    // Check if Twilio phone number is configured
    if (!process.env.TWILIO_PHONE_NUMBER) {
        logger.logNotification('sms', false, {
            requestId: appointmentData.requestId,
            reason: 'Twilio phone number not configured'
        });
        return false;
    }

    try {
        // Format phone number
        const toPhone = formatPhoneToE164(appointmentData.phone);

        if (!toPhone) {
            logger.logNotification('sms', false, {
                requestId: appointmentData.requestId,
                reason: 'Invalid phone number format',
                phone: appointmentData.phone
            });
            return false;
        }

        // Generate message
        const messageBody = generateAppointmentConfirmationMessage(appointmentData.requestId);

        // Send SMS
        const message = await client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: toPhone
        });

        logger.logNotification('sms', true, {
            requestId: appointmentData.requestId,
            recipient: toPhone,
            messageSid: message.sid,
            status: message.status
        });

        return true;
    } catch (error) {
        logger.logNotification('sms', false, {
            requestId: appointmentData.requestId,
            error: error.message,
            code: error.code,
            phone: appointmentData.phone
        });
        return false;
    }
};

/**
 * Verify SMS service configuration
 * @returns {Promise<boolean>} Whether the SMS service is properly configured
 */
const verifySMSService = async () => {
    const client = initializeTwilioClient();

    if (!client) {
        return false;
    }

    try {
        // Fetch account info to verify credentials
        await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        logger.info('SMS service verified successfully');
        return true;
    } catch (error) {
        logger.error('SMS service verification failed', { error: error.message });
        return false;
    }
};

module.exports = {
    sendAppointmentConfirmationSMS,
    verifySMSService,
    formatPhoneToE164,
    initializeTwilioClient
};
