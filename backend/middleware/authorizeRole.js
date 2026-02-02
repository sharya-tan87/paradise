const logger = require('../utils/logger');

// Role hierarchy levels
const ROLE_HIERARCHY = {
    admin: 5,
    manager: 4,
    dentist: 3,
    staff: 2,
    patient: 1
};

/**
 * Middleware to authorize user based on role
 * @param {Array} allowedRoles - Array of role strings that can access the route
 * @param {Object} options - Optional configuration
 * @param {boolean} options.strict - If true, only exact role matches allowed (no hierarchy)
 * @returns {Function} Express middleware function
 *
 * Usage:
 *   authorizeRole(['admin', 'manager']) - Admin and Manager only, with hierarchy
 *   authorizeRole(['patient'], { strict: true }) - Patient ONLY, no admin override
 */
const authorizeRole = (allowedRoles, options = {}) => {
    const { strict = false } = options;

    return (req, res, next) => {
        // User should be set by authenticate middleware
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role;
        const userLevel = ROLE_HIERARCHY[userRole] || 0;

        // Check if user's role is in allowed roles (exact match)
        if (allowedRoles.includes(userRole)) {
            return next();
        }

        // SECURITY FIX: If strict mode, only exact role matches are allowed
        // Use this for patient-only endpoints or role-specific features
        if (strict) {
            logger.warn('Authorization failed (strict mode)', {
                userId: req.user.userId || req.user.id,
                username: req.user.username,
                userRole: userRole,
                requiredRoles: allowedRoles,
                strictMode: true,
                resource: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });

            return res.status(403).json({
                message: 'Access denied. This endpoint requires specific role access.'
            });
        }

        // Non-strict mode: Check hierarchy
        // Higher roles can access lower role endpoints
        // We take the MINIMUM level from the allowed roles as the base requirement
        const requiredLevel = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 0));

        if (userLevel >= requiredLevel) {
            return next();
        }

        // Log authorization failure
        logger.warn('Authorization failed', {
            userId: req.user.userId || req.user.id,
            username: req.user.username,
            userRole: userRole,
            requiredRoles: allowedRoles,
            resource: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        return res.status(403).json({
            message: 'Access denied. Insufficient permissions.'
        });
    };
};

module.exports = authorizeRole;
