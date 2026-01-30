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
 * @returns {Function} Express middleware function
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        // User should be set by authenticate middleware
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role;
        const userLevel = ROLE_HIERARCHY[userRole] || 0;

        // Check if user's role is in allowed roles
        if (allowedRoles.includes(userRole)) {
            return next();
        }

        // Check hierarchy: user can access if their level >= highest required level
        // We find the "minimum required level" implied by the allowedRoles. 
        // Actually, usually RBAC with hierarchy implies: "If I need 'staff' access, 'admin' can also access".
        // So we should find the level of the *lowest* role in allowedRoles (the base requirement) 
        // and see if userLevel is >= that.
        // However, the Dev Notes code says: 
        // `const requiredLevel = Math.max(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 0));`
        // This implies that if allowedRoles=['staff', 'admin'], requiredLevel is 5 (admin)?? 
        // That would mean 'staff' (level 2) CANNOT access if 'admin' is in the list? That seems wrong if 'staff' IS in the list.
        // Wait, the logic in Dev Notes:
        // `if (allowedRoles.includes(userRole)) { return next(); }` checks exact match first.
        // Then `if (userLevel >= requiredLevel)`.
        // If allowedRoles=['staff'] (level 2). Required is 2. Admin (5) >= 2. Access granted. Correct.
        // If allowedRoles=['staff', 'dentist'] (levels 2, 3). Required is max(2,3) = 3.
        // Staff (2) is in allowedRoles -> Access granted.
        // Admin (5) is NOT in allowedRoles -> Access granted because 5 >= 3.
        // Patient (1) -> Access denied.
        // But wait, if I have a route for ONLY 'patient' (level 1). allowedRoles=['patient'].
        // Admin (5) >= 1. Admin accesses patient route?
        // Story says "Higher roles inherit permissions of lower roles". So Admin > Patient. Yes.

        // BUT what if allowedRoles=['admin']. Required=5. Staff(2) < 5. Denied.
        // What if allowedRoles=['staff']. Required=2. Admin(5) >= 2. Granted.

        // There is a potential edge case: What if allowedRoles=['patient'] but we DON'T want admin to access?
        // Typically admins can access everything. AC 6 says "Higher roles inherit permissions... (e.g., Admin can access Staff endpoints)".
        // So the Max logic seems to support "Implicit inheritance".

        // We want to find the base role level that allows access.
        // Anyone with a level >= that base level should be allowed.
        // So we take the MINIMUM level from the allowed roles.
        const requiredLevel = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 0));

        if (userLevel >= requiredLevel) {
            return next();
        }

        // Log authorization failure
        logger.warn('Authorization failed', {
            userId: req.user.userId || req.user.id, // Handle potential key difference. Token usually has userId.
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
