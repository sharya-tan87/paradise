import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { submitAppointmentRequest } from '../services/api';

const BookingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState(null);
    const [apiErrors, setApiErrors] = useState([]);

    // Phone validation: Accept 10-digit Thai phone numbers with or without dashes
    // Examples: 0812345678, 081-234-5678, 02-1234-5678, 0952597922, 095-259-7922
    const phoneRegex = /^0[0-9]{9}$|^0[2-9]-[0-9]{4}-[0-9]{4}$|^0[0-9]{2}-[0-9]{3}-[0-9]{4}$/;

    // Calculate max date (6 months from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const schema = yup.object({
        name: yup.string()
            .required(t('booking.errors.required'))
            .min(2, 'Name must be at least 2 characters'),

        phone: yup.string()
            .required(t('booking.errors.required'))
            .matches(phoneRegex, t('booking.errors.phone')),

        email: yup.string()
            .required(t('booking.errors.required'))
            .email('Invalid email format'),

        preferredDate: yup.date()
            .required(t('booking.errors.required'))
            .min(today, 'Date must be in the future')
            .max(sixMonthsFromNow, 'Date must be within 6 months'),

        preferredTime: yup.string()
            .required(t('booking.errors.required')),

        serviceType: yup.string()
            .required(t('booking.errors.required'))
            .oneOf(
                ['General Checkup', 'Teeth Cleaning', 'Cosmetic Dentistry', 'Orthodontics', 'Dental Implants', 'Other'],
                'Invalid service type'
            ),

        notes: yup.string()
            .max(500, 'Notes cannot exceed 500 characters')
    });

    const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange'
    });

    const onSubmit = async (data) => {
        setSubmitError(null);
        setApiErrors([]);
        try {
            const response = await submitAppointmentRequest(data);
            navigate('/booking/success', {
                state: {
                    requestId: response.requestId,
                    name: data.name,
                    date: data.preferredDate,
                    time: data.preferredTime,
                    service: data.serviceType
                }
            });
        } catch (error) {
            console.error('Booking error:', error);

            // Handle backend validation errors
            if (error.response && error.response.data && error.response.data.details) {
                setApiErrors(error.response.data.details);
            } else {
                setSubmitError(error.message || 'An error occurred. Please try again.');
            }
        }
    };

    // Generate time slots 9:00 AM - 6:00 PM
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (hour === 18 && minute > 0) break;
                const time = `${hour > 12 ? hour - 12 : hour}:${minute === 0 ? '00' : minute} ${hour >= 12 ? 'PM' : 'AM'}`;
                slots.push(time);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="min-h-screen bg-white font-prompt flex flex-col">
            <Header />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
                            {t('booking.title')}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            {t('booking.subtitle')}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-primary-100 overflow-hidden">
                        <div className="h-2 bg-brand w-full"></div>

                        <div className="p-6 md:p-8">
                            {/* API Validation Errors */}
                            {apiErrors.length > 0 && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-red-800 mb-2">Validation Errors</h3>
                                    <ul className="list-disc list-inside">
                                        {apiErrors.map((error, index) => (
                                            <li key={index} className="text-red-700 font-prompt text-sm">{error.field}: {error.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* General Submit Error */}
                            {submitError && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                                        <div className="mt-1 text-sm text-red-700">{submitError}</div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-primary-900 font-semibold mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-brand" />
                                        {t('booking.form.name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        {...register('name')}
                                        placeholder={t('booking.form.namePlaceholder')}
                                        aria-invalid={errors.name ? 'true' : 'false'}
                                        aria-describedby={errors.name ? 'name-error' : undefined}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-brand outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    />
                                    {errors.name && (
                                        <p id="name-error" className="text-red-600 font-prompt text-sm mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Phone & Email Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="block text-primary-900 font-semibold mb-2 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-brand" />
                                            {t('booking.form.phone')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            {...register('phone', {
                                                onChange: (e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length > 10) value = value.slice(0, 10);

                                                    let formattedValue = value;
                                                    if (value.length > 0) {
                                                        if (value.startsWith('02')) {
                                                            if (value.length > 2) {
                                                                formattedValue = value.slice(0, 2) + '-' + value.slice(2);
                                                            }
                                                            if (value.length > 6) {
                                                                formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7);
                                                            }
                                                        } else {
                                                            if (value.length > 3) {
                                                                formattedValue = value.slice(0, 3) + '-' + value.slice(3);
                                                            }
                                                            if (value.length > 6) {
                                                                formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7);
                                                            }
                                                        }
                                                    }
                                                    e.target.value = formattedValue;
                                                }
                                            })}
                                            placeholder="0XX-XXX-XXXX"
                                            aria-invalid={errors.phone ? 'true' : 'false'}
                                            aria-describedby={errors.phone ? 'phone-error' : undefined}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-brand outline-none transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        />
                                        {errors.phone && (
                                            <p id="phone-error" className="text-red-600 font-prompt text-sm mt-1">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-primary-900 font-semibold mb-2 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-brand" />
                                            {t('booking.form.email')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            {...register('email')}
                                            placeholder={t('booking.form.emailPlaceholder')}
                                            aria-invalid={errors.email ? 'true' : 'false'}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-brand outline-none transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        />
                                        {errors.email && (
                                            <p id="email-error" className="text-red-600 font-prompt text-sm mt-1">{errors.email.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Date & Time Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Date */}
                                    <div>
                                        <label htmlFor="preferredDate" className="block text-primary-900 font-semibold mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-brand" />
                                            {t('booking.form.date')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="preferredDate"
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            max={sixMonthsFromNow.toISOString().split('T')[0]}
                                            {...register('preferredDate')}
                                            aria-invalid={errors.preferredDate ? 'true' : 'false'}
                                            aria-describedby={errors.preferredDate ? 'preferredDate-error' : undefined}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-brand outline-none transition-all ${errors.preferredDate ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        />
                                        {errors.preferredDate && (
                                            <p id="preferredDate-error" className="text-red-600 font-prompt text-sm mt-1">{errors.preferredDate.message}</p>
                                        )}
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <label htmlFor="preferredTime" className="block text-primary-900 font-semibold mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-brand" />
                                            {t('booking.form.time')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="preferredTime"
                                            {...register('preferredTime')}
                                            aria-invalid={errors.preferredTime ? 'true' : 'false'}
                                            aria-describedby={errors.preferredTime ? 'preferredTime-error' : undefined}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-brand outline-none transition-all bg-white ${errors.preferredTime ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        >
                                            <option value="">{t('booking.form.timePlaceholder')}</option>
                                            {timeSlots.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                        {errors.preferredTime && (
                                            <p id="preferredTime-error" className="text-red-600 font-prompt text-sm mt-1">{errors.preferredTime.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Service Type */}
                                <div>
                                    <label htmlFor="serviceType" className="block text-primary-900 font-semibold mb-2">
                                        {t('booking.form.service')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="serviceType"
                                        {...register('serviceType')}
                                        aria-invalid={errors.serviceType ? 'true' : 'false'}
                                        aria-describedby={errors.serviceType ? 'serviceType-error' : undefined}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-brand outline-none transition-all bg-white ${errors.serviceType ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                    >
                                        <option value="">{t('booking.form.servicePlaceholder')}</option>
                                        <option value="General Checkup">{t('booking.services.general')}</option>
                                        <option value="Teeth Cleaning">{t('booking.services.cleaning')}</option>
                                        <option value="Cosmetic Dentistry">{t('booking.services.cosmetic')}</option>
                                        <option value="Orthodontics">{t('booking.services.ortho')}</option>
                                        <option value="Dental Implants">{t('booking.services.implants')}</option>
                                        <option value="Other">{t('booking.services.other')}</option>
                                    </select>
                                    {errors.serviceType && (
                                        <p id="serviceType-error" className="text-red-600 font-prompt text-sm mt-1">{errors.serviceType.message}</p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label htmlFor="notes" className="block text-primary-900 font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-brand" />
                                        {t('booking.form.notes')}
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows="4"
                                        {...register('notes')}
                                        placeholder={t('booking.form.notesPlaceholder')}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-brand outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                    className="w-full bg-brand text-white font-prompt font-semibold py-4 px-6 rounded-lg hover:bg-brand-dark transition-all duration-300 shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            {t('booking.form.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            {t('booking.form.submit')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingPage;
