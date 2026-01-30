/**
 * Logger Utility
 * Provides structured logging for notification attempts and general application logs
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for log entries
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        let metaString = Object.keys(metadata).length
            ? JSON.stringify(metadata)
            : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
);

// JSON format for file logs
const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: jsonFormat,
    defaultMeta: { service: 'paradise-dental-api' },
    transports: [
        // General application logs
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log')
        }),
        // Notification-specific logs
        new winston.transports.File({
            filename: path.join(logsDir, 'notifications.log'),
            level: 'info'
        })
    ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: logFormat
    }));
}

/**
 * Log a notification attempt
 * @param {string} type - 'email' or 'sms'
 * @param {boolean} success - Whether the notification was sent successfully
 * @param {Object} details - Additional details about the notification
 */
logger.logNotification = (type, success, details) => {
    const level = success ? 'info' : 'error';
    const status = success ? 'SUCCESS' : 'FAILED';

    logger.log(level, `${type.toUpperCase()} notification ${status}`, {
        notificationType: type,
        success,
        ...details
    });
};

module.exports = logger;
