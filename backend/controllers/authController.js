const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Validation failed',
                details: [{ field: 'username/password', message: 'Username and password are required' }]
            });
        }

        // 1. Find User
        const user = await User.findOne({ where: { username } });
        if (!user) {
            // Create separate log for security audit but return generic message
            logger.warn(`Login failed: User not found - ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 2. Check Password
        // Using the instance method if available, or direct bcrypt comparison
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            logger.warn(`Login failed: Invalid password - ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Generate Tokens (configurable expiry from .env)
        const accessToken = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRY || '8h' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
        );

        logger.info(`User logged in successfully: ${username}`);

        // 4. Return tokens and user data (excluding password_hash)
        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        logger.error(`Login error: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }

        // Verify token with algorithm restriction (security fix)
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
        } catch (err) {
            logger.warn('Refresh token verification failed');
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = await User.findByPk(decoded.userId);
        if (!user) {
            logger.warn('Refresh token user not found');
            return res.status(401).json({ message: 'User not found' });
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRY || '8h' }
        );

        const newRefreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
        );

        logger.info(`Token refreshed for user: ${user.username}`);

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {
        logger.error(`Refresh error: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
};

// Token blacklist for invalidated tokens (in-memory for now)
// TODO: In production, use Redis or database for persistence across restarts
const tokenBlacklist = new Set();

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user.userId;
        const username = req.user.username;

        // Add refresh token to blacklist if provided
        if (refreshToken) {
            tokenBlacklist.add(refreshToken);
        }

        logger.info(`User logged out: ${username}`, {
            userId,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: 'An error occurred during logout.' });
    }
};

// Helper function to check if token is blacklisted
exports.isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
