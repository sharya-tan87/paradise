import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, User } from 'lucide-react';

const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'staff', label: 'Staff' }
];

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading, allowedRoles = [] }) => {
    const isEditMode = !!initialData?.id;

    const filteredRoles = allowedRoles.length > 0
        ? ROLES.filter(r => allowedRoles.includes(r.value))
        : ROLES;

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            role: 'staff',
            firstName: '',
            lastName: ''
        }
    });


    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                username: initialData.username || '',
                email: initialData.email || '',
                password: '', // Never pre-fill password
                role: initialData.role || 'staff',
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || ''
            });
        } else if (isOpen) {
            reset({
                username: '',
                email: '',
                password: '',
                role: 'staff',
                firstName: '',
                lastName: ''
            });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const handleFormSubmit = (data) => {
        // In edit mode, don't include password in submission
        if (isEditMode) {
            // Only include password if user entered a new one
            if (!data.password) {
                delete data.password;
            }
            delete data.username; // Cannot change username
        }
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-50 p-2 rounded-lg">
                            <User className="text-teal-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-primary-900">
                            {isEditMode ? 'Edit User' : 'Create New User'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                        <input
                            type="text"
                            disabled={isEditMode}
                            {...register('username', {
                                required: !isEditMode && 'Username is required',
                                minLength: { value: 3, message: 'Username must be at least 3 characters' }
                            })}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                                } ${errors.username ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="Enter username"
                        />
                        {errors.username && <span className="text-red-500 text-xs mt-1">{errors.username.message}</span>}
                        {isEditMode && <span className="text-gray-500 text-xs mt-1">Username cannot be changed</span>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                            })}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="user@example.com"
                        />
                        {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {isEditMode ? 'Password (Leave blank to keep current)' : 'Password *'}
                        </label>
                        <input
                            type="password"
                            {...register('password', {
                                required: !isEditMode && 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' }
                            })}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder={isEditMode ? "Enter new password" : "Minimum 8 characters"}
                        />
                        {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                        <select
                            {...register('role', { required: 'Role is required' })}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none bg-white ${errors.role ? 'border-red-500' : 'border-gray-200'}`}
                        >
                            {filteredRoles.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        {errors.role && <span className="text-red-500 text-xs mt-1">{errors.role.message}</span>}
                    </div>

                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                {...register('firstName')}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                {...register('lastName')}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isEditMode ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
