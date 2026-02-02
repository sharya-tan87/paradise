const { User, Sequelize } = require('../models');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

const listUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const whereClause = {};

        if (role) {
            whereClause.role = role;
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'username', 'email', 'role', 'created_at'] // Exclude password_hash
        });

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        logger.error('Failed to list users', { error: error.message });
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        // SECURITY FIX: JWT token uses 'userId' not 'id'
        const userId = req.user.userId;

        // Users can only update their own profile (compare as strings for safety)
        if (String(id) !== String(userId)) {
            return res.status(403).json({
                success: false,
                error: 'You can only update your own profile'
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const { username, email, currentPassword, newPassword } = req.body;
        const updates = {};

        // Update username
        if (username && username !== user.username) {
            // Check if username is taken
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser && existingUser.id !== id) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already taken'
                });
            }
            updates.username = username;
        }

        // Update email
        if (email !== undefined) {
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser && existingUser.id !== id) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email already taken'
                    });
                }
            }
            updates.email = email || null;
        }

        // Update password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is required to change password'
                });
            }

            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }

            updates.password_hash = await bcrypt.hash(newPassword, 10);
        }

        // Handle image upload
        if (req.file) {
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
            await fs.mkdir(uploadsDir, { recursive: true });

            // Save the file
            const filename = `${id}-${Date.now()}${path.extname(req.file.originalname)}`;
            const filepath = path.join(uploadsDir, filename);
            await fs.writeFile(filepath, req.file.buffer);

            // Delete old image if exists
            if (user.imagePath) {
                const oldPath = path.join(__dirname, '..', user.imagePath);
                try {
                    await fs.unlink(oldPath);
                } catch (e) {
                    // Ignore if file doesn't exist
                }
            }

            updates.imagePath = `/uploads/profiles/${filename}`;
        }

        // Apply updates
        if (Object.keys(updates).length > 0) {
            await user.update(updates);
        }

        // Return updated user data (excluding password_hash)
        const updatedUser = await User.findByPk(id, {
            attributes: ['id', 'username', 'email', 'role', 'imagePath', 'created_at']
        });

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            ...updatedUser.toJSON()
        });
    } catch (error) {
        logger.error('Failed to update user profile', { error: error.message });
        return res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

module.exports = {
    listUsers,
    updateUserProfile
};
