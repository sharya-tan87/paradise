import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Role hierarchy levels (must match backend)
const ROLE_HIERARCHY = {
    admin: 5,
    manager: 4,
    dentist: 3,
    staff: 2,
    patient: 1
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0) {
        if (!userStr) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        try {
            const user = JSON.parse(userStr);
            const userRole = user.role;
            const userLevel = ROLE_HIERARCHY[userRole] || 0;

            // Check if user's role is in allowed roles (exact match)
            if (allowedRoles.includes(userRole)) {
                return children;
            }

            // Check hierarchy: user can access if their level >= highest required level
            // Use Math.min because if ANY of the allowed roles is lower than or equal to user's level, they should pass?
            // Actually, we want the BASE requirement. 
            // If allowed=['staff', 'admin'], base is Staff (2). Manager(4) should access. 
            // So we need MIN level.
            const requiredLevel = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 0));

            if (userLevel >= requiredLevel) {
                return children;
            }

            // Not authorized
            return <Navigate to="/unauthorized" replace />;
        } catch (e) {
            // If JSON parse fails, force login
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
