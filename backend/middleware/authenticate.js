const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];

        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Verify with explicit algorithm to prevent algorithm substitution attacks
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            complete: false
        });

        // Check if token payload has required fields
        if (!decoded.userId || !decoded.role) {
            logger.warn('Invalid token payload', { userId: decoded.userId });
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        if (error.name === 'JsonWebTokenError') {
            logger.warn('JWT verification failed', { error: error.message, ip: req.ip });
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({ message: 'Token not yet valid' });
        }
        logger.error('Authentication error', { error: error.message });
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = authenticate;
