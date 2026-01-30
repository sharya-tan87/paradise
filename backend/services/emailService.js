/**
 * Email Service
 * Handles sending email notifications using Nodemailer
 */
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Create reusable transporter
let transporter = null;

/**
 * Initialize the email transporter
 * Creates a Nodemailer transport with SMTP settings from environment variables
 */
const initializeTransporter = () => {
    if (transporter) return transporter;

    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        logger.warn('Email service not configured - SMTP settings missing');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE !== 'false', // Default to true for port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        // Allow self-signed certificates in development
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
    });

    return transporter;
};

/**
 * Load and render HTML email template
 * @param {string} templateName - Name of the template file
 * @param {Object} variables - Variables to replace in the template
 * @returns {string} Rendered HTML
 */
const renderTemplate = (templateName, variables) => {
    const templatePath = path.join(__dirname, '..', 'templates', 'email', templateName);

    try {
        let template = fs.readFileSync(templatePath, 'utf-8');

        // Replace all template variables
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, variables[key] || 'N/A');
        });

        // Handle conditional blocks {{#if notes}}...{{/if}}
        template = template.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, key, content) => {
            return variables[key] ? content : '';
        });

        return template;
    } catch (error) {
        logger.error('Failed to load email template', { templateName, error: error.message });
        throw error;
    }
};

/**
 * Format date for display in email
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

/**
 * Send appointment notification email to clinic admin
 * @param {Object} appointmentData - Appointment request data
 * @param {string} appointmentData.requestId - Unique request identifier
 * @param {string} appointmentData.name - Patient's full name
 * @param {string} appointmentData.phone - Patient's phone number
 * @param {string} appointmentData.email - Patient's email
 * @param {string} appointmentData.preferredDate - Preferred appointment date
 * @param {string} appointmentData.preferredTime - Preferred appointment time
 * @param {string} appointmentData.serviceType - Type of dental service
 * @param {string} [appointmentData.notes] - Additional notes
 * @returns {Promise<boolean>} Success status
 */
const sendAppointmentNotificationEmail = async (appointmentData) => {
    const transport = initializeTransporter();

    if (!transport) {
        logger.logNotification('email', false, {
            requestId: appointmentData.requestId,
            reason: 'Email service not configured'
        });
        return false;
    }

    try {
        // Prepare template variables
        const templateVars = {
            patientName: appointmentData.name,
            patientPhone: appointmentData.phone,
            patientEmail: appointmentData.email,
            preferredDate: formatDate(appointmentData.preferredDate),
            preferredTime: appointmentData.preferredTime,
            serviceType: appointmentData.serviceType,
            notes: appointmentData.notes || '',
            requestId: appointmentData.requestId,
            adminUrl: process.env.ADMIN_URL || 'http://localhost:5173'
        };

        // Render email HTML
        const html = renderTemplate('appointmentRequest.html', templateVars);

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Paradise Dental" <noreply@paradisedental.com>',
            to: process.env.ADMIN_EMAIL,
            subject: 'New Appointment Request - Paradise Dental',
            html: html,
            // Plain text fallback
            text: `
New Appointment Request - Paradise Dental

Patient Information:
- Name: ${templateVars.patientName}
- Phone: ${templateVars.patientPhone}
- Email: ${templateVars.patientEmail}

Requested Appointment:
- Date: ${templateVars.preferredDate}
- Time: ${templateVars.preferredTime}
- Service: ${templateVars.serviceType}

${templateVars.notes ? `Additional Notes: ${templateVars.notes}` : ''}

Reference ID: ${templateVars.requestId}
            `.trim()
        };

        // Check if admin email is configured
        if (!mailOptions.to) {
            logger.logNotification('email', false, {
                requestId: appointmentData.requestId,
                reason: 'Admin email not configured'
            });
            return false;
        }

        // Send email
        const info = await transport.sendMail(mailOptions);

        logger.logNotification('email', true, {
            requestId: appointmentData.requestId,
            recipient: mailOptions.to,
            messageId: info.messageId
        });

        return true;
    } catch (error) {
        logger.logNotification('email', false, {
            requestId: appointmentData.requestId,
            error: error.message,
            code: error.code
        });
        return false;
    }
};

/**
 * Verify email service configuration
 * @returns {Promise<boolean>} Whether the email service is properly configured
 */
const verifyEmailService = async () => {
    const transport = initializeTransporter();

    if (!transport) {
        return false;
    }

    try {
        await transport.verify();
        logger.info('Email service verified successfully');
        return true;
    } catch (error) {
        logger.error('Email service verification failed', { error: error.message });
        return false;
    }
};

module.exports = {
    sendAppointmentNotificationEmail,
    verifyEmailService,
    initializeTransporter
};
