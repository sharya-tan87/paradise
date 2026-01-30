import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '../services/api';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        mode: 'onSubmit'
    });

    const onSubmit = async (data) => {
        setApiError('');
        try {
            const response = await login(data.username, data.password);

            // Store tokens and user info in a single user object
            // This matches the expected format in api.js getAuthDetails()
            const userData = {
                ...response.user,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken
            };

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Redirect based on role
            const role = response.user.role;
            if (role === 'admin') {
                navigate('/dashboard/admin');
            } else if (role === 'manager') {
                navigate('/dashboard/manager');
            } else if (role === 'dentist') {
                navigate('/dashboard/dentist');
            } else if (role === 'staff') {
                navigate('/dashboard/staff');
            } else {
                navigate('/dashboard/patient');
            }
        } catch (error) {
            setApiError(error.message || 'Invalid credentials');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-white border border-primary-100 rounded-xl shadow-soft p-6 md:p-8 font-prompt">

                {/* Header / Logo Section */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary-900 mb-2">
                        Paradise Dental
                    </h1>
                    <p className="text-primary-500 font-medium">
                        Welcome Back
                    </p>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
                        {apiError}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Username Field */}
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="block text-primary-900 font-medium"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            className={`w-full bg-white border ${errors.username ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-colors`}
                            placeholder="Enter your username"
                            {...register('username', { required: 'Username is required' })}
                        />
                        {errors.username && (
                            <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-primary-900 font-medium"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-colors`}
                                placeholder="Enter your password"
                                {...register('password', { required: 'Password is required' })}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-900 transition-colors focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary-500 text-white rounded-lg px-6 py-3 hover:bg-primary-900 transition-colors shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
