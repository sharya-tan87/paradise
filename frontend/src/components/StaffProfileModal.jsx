import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    X, Save, Loader2, User, Mail, Lock, Eye, EyeOff, Camera
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateUserProfile } from '../services/api';

const StaffProfileModal = ({ isOpen, onClose, user, onProfileUpdate }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            username: '',
            email: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const newPassword = watch('newPassword');

    useEffect(() => {
        if (isOpen && user) {
            reset({
                username: user.username || '',
                email: user.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setMessage({ type: '', text: '' });
            setPreviewImage(user.imagePath ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'}${user.imagePath}` : null);
            setImageFile(null);
        }
    }, [isOpen, user, reset]);

    const onSubmit = async (data) => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate password if changing
            if (data.newPassword) {
                if (!data.currentPassword) {
                    setMessage({ type: 'error', text: t('staffProfile.error.currentPasswordRequired') });
                    setSaving(false);
                    return;
                }
                if (data.newPassword !== data.confirmPassword) {
                    setMessage({ type: 'error', text: t('staffProfile.error.passwordMismatch') });
                    setSaving(false);
                    return;
                }
                if (data.newPassword.length < 6) {
                    setMessage({ type: 'error', text: t('staffProfile.error.passwordTooShort') });
                    setSaving(false);
                    return;
                }
            }

            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('email', data.email);

            if (data.newPassword) {
                formData.append('currentPassword', data.currentPassword);
                formData.append('newPassword', data.newPassword);
            }

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await updateUserProfile(user.id, formData);

            // Update localStorage with new user data
            const updatedUser = {
                ...user,
                username: data.username,
                email: data.email,
                imagePath: response.imagePath || user.imagePath
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setMessage({ type: 'success', text: t('staffProfile.success.saved') });

            if (onProfileUpdate) {
                onProfileUpdate(updatedUser);
            }

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: error.error || t('staffProfile.error.saveFailed') });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-50 p-2 rounded-lg">
                            <User className="text-teal-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary-900">
                                {t('staffProfile.title')}
                            </h2>
                            <p className="text-sm text-gray-500">{t('staffProfile.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Message */}
                        {message.text && (
                            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Profile Picture */}
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-gray-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full text-white shadow-md cursor-pointer hover:bg-teal-700 transition-colors">
                                    <Camera size={18} />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setImageFile(file);
                                                setPreviewImage(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="flex items-center gap-2">
                                        <User size={14} className="text-gray-400" />
                                        {t('staffProfile.username')}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('username', { required: true })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                    placeholder={t('staffProfile.usernamePlaceholder')}
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-xs mt-1">{t('staffProfile.error.usernameRequired')}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <span className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        {t('staffProfile.email')}
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    {...register('email', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: t('staffProfile.error.invalidEmail')
                                        }
                                    })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                    placeholder={t('staffProfile.emailPlaceholder')}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <Lock size={16} className="text-gray-400" />
                                {t('staffProfile.changePassword')}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">{t('staffProfile.passwordHint')}</p>

                            <div className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('staffProfile.currentPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...register('currentPassword')}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('staffProfile.newPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...register('newPassword')}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('staffProfile.confirmPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        {...register('confirmPassword')}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-100 shrink-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            {t('staffProfile.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {t('staffProfile.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffProfileModal;
