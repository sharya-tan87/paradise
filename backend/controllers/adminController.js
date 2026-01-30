const { User } = require('../models');
const { Op } = require('sequelize');
const { generateTempPassword } = require('../utils/passwordGenerator');

// Role hierarchy levels (Must match authorizeRole.js)
const ROLE_HIERARCHY = {
    admin: 5,
    manager: 4,
    dentist: 3,
    staff: 2,
    patient: 1
};

// Helper: Check if requester can manage target role
// Returns true if requester (e.g. Admin) > target (e.g. Manager)
// For list filtering: return list of allowed roles
const getManageableRoles = (userRole) => {
    // Special case for Staff: Can ONLY manage Dentists and Patients (NOT admin, manager, or other staff)
    if (userRole === 'staff') {
        return ['dentist', 'patient'];
    }

    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    // Return roles with level strictly less than userLevel
    return Object.keys(ROLE_HIERARCHY).filter(r => ROLE_HIERARCHY[r] < userLevel);
};

// Helper: Verify permission
const checkPermission = (requesterRole, targetRole) => {
    if (requesterRole === 'admin') return true; // Admin can do anything

    // Special case: Staff can ONLY manage Dentist and Patient (NOT admin, manager, or other staff)
    if (requesterRole === 'staff' && (targetRole === 'dentist' || targetRole === 'patient')) {
        return true;
    }

    // Staff cannot manage other staff, admin, or manager
    if (requesterRole === 'staff') {
        return false;
    }

    const requesterLevel = ROLE_HIERARCHY[requesterRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
    return requesterLevel > targetLevel;
};

// List all users with optional filters
exports.listUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const requesterRole = req.user.role;

        const whereClause = {};

        // Security: Filter visible roles for non-admins
        if (requesterRole !== 'admin') {
            const allowedRoles = getManageableRoles(requesterRole);
            if (role && role !== 'all') {
                if (!allowedRoles.includes(role)) {
                    // If asking for a role they can't see, return empty or error
                    // Let's just return empty to fail gracefully
                    return res.json([]);
                }
                whereClause.role = role;
            } else {
                // Determine visible roles
                whereClause.role = { [Op.in]: allowedRoles };
            }
        } else if (role && role !== 'all') {
            whereClause.role = role;
        }

        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName', 'active', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        console.error('Error listing users:', error);
        res.status(500).json({ error: 'Failed to list users' });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, firstName, lastName } = req.body;
        const requesterRole = req.user.role;

        // Validation required fields
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Username, email, password, and role are required' });
        }

        // Security: Check if requester can create this role
        if (!checkPermission(requesterRole, role)) {
            return res.status(403).json({ error: 'Insufficient permissions to create user with this role' });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Hash password
        const password_hash = await User.hashPassword(password);

        // Create user
        const user = await User.create({
            username,
            email,
            password_hash,
            role,
            firstName: firstName || null,
            lastName: lastName || null,
            active: true
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            active: user.active
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// Update user (cannot change username or password via this endpoint)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, firstName, lastName, active } = req.body;
        const requesterRole = req.user.role;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Security: Check if requester can edit this user's current role
        if (!checkPermission(requesterRole, user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions to modify this user' });
        }

        // Security: If changing role, check if requester can assign the new role
        if (role && !checkPermission(requesterRole, role)) {
            return res.status(403).json({ error: 'Insufficient permissions to assign this role' });
        }

        // Check if email already exists (if changing)
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        // Update fields
        const updateData = {};
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (active !== undefined) updateData.active = active;

        // Update password if provided
        const { password } = req.body;
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters' });
            }
            updateData.password_hash = await User.hashPassword(password);
        }

        await user.update(updateData);

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            active: user.active
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Deactivate user (soft delete)
exports.deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterRole = req.user.role;

        // Prevent self-deletion
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot deactivate your own account' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Security check
        if (!checkPermission(requesterRole, user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions to deactivate this user' });
        }

        await user.update({ active: false });

        res.json({ message: 'User deactivated successfully', id: user.id });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ error: 'Failed to deactivate user' });
    }
};

// Activate user
exports.activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterRole = req.user.role;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Security check
        if (!checkPermission(requesterRole, user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions to activate this user' });
        }

        await user.update({ active: true });

        res.json({ message: 'User activated successfully', id: user.id });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ error: 'Failed to activate user' });
    }
};

// Reset password (generate temporary password or use provided one)
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const requesterRole = req.user.role;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Security check
        if (!checkPermission(requesterRole, user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions to reset password for this user' });
        }

        let tempPassword;

        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters' });
            }
            tempPassword = newPassword;
        } else {
            // Generate temporary password
            tempPassword = generateTempPassword(12);
        }

        // Hash and update
        const password_hash = await User.hashPassword(tempPassword);
        await user.update({ password_hash });

        // Return temp password to admin (display once only)
        res.json({
            message: 'Password reset successfully',
            temporaryPassword: tempPassword,
            username: user.username
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
// Permanent Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterRole = req.user.role;

        // Prevent self-deletion
        if (id == req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Security check
        if (!checkPermission(requesterRole, user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions to delete this user' });
        }

        await user.destroy();

        res.json({ message: 'User deleted successfully', id: user.id });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user. Check for dependent records.' });
    }
};
