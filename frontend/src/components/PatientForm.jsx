import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Phone, Mail, AlertCircle, Heart, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PatientForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const { t } = useTranslation();

    // Validation Schema
    const schema = yup.object({
        title: yup.string().required(t('patientForm.validation.titleRequired')),
        firstName: yup.string().required(t('patientForm.validation.firstNameRequired')),
        lastName: yup.string().required(t('patientForm.validation.lastNameRequired')),
        dateOfBirth: yup.date()
            .required(t('patientForm.validation.dobRequired'))
            .max(new Date(), t('patientForm.validation.dobFuture'))
            .typeError(t('patientForm.validation.dobInvalid')),
        gender: yup.string().required(t('patientForm.validation.genderRequired')),
        phone: yup.string()
            .required(t('patientForm.validation.phoneRequired'))
            .matches(/^0[2-9]-?[0-9]{3,4}-?[0-9]{4}$/, t('patientForm.validation.phoneInvalid')),
        email: yup.string().email(t('patientForm.validation.emailInvalid')).nullable(),
        address: yup.string().nullable(),
        emergencyContactName: yup.string().nullable(),
        emergencyContactPhone: yup.string().nullable(),
        dentalComplaint: yup.string().nullable(),
        lastDentalVisit: yup.string().nullable(),
        medicalHistory: yup.string().nullable(),
        allergies: yup.string().nullable(),
        currentMedications: yup.string().nullable(),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: initialData || {
            title: 'Mr.',
            gender: 'male'
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-500" />
                    {t('patientForm.sections.personalInfo')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.title')} *</label>
                        <select
                            {...register('title')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="Mr.">{t('patientForm.options.mr')}</option>
                            <option value="Ms.">{t('patientForm.options.ms')}</option>
                            <option value="Mrs.">{t('patientForm.options.mrs')}</option>
                            <option value="Dr.">{t('patientForm.options.dr')}</option>
                        </select>
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.firstName')} *</label>
                        <input
                            type="text"
                            {...register('firstName')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>

                    <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.lastName')} *</label>
                        <input
                            type="text"
                            {...register('lastName')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>

                    <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.dateOfBirth')} *</label>
                        <input
                            type="date"
                            {...register('dateOfBirth')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                    </div>

                    <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.gender')} *</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center">
                                <input type="radio" value="male" {...register('gender')} className="text-primary-500 focus:ring-primary-500" />
                                <span className="ml-2 text-sm text-gray-700">{t('patientForm.options.male')}</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" value="female" {...register('gender')} className="text-primary-500 focus:ring-primary-500" />
                                <span className="ml-2 text-sm text-gray-700">{t('patientForm.options.female')}</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" value="other" {...register('gender')} className="text-primary-500 focus:ring-primary-500" />
                                <span className="ml-2 text-sm text-gray-700">{t('patientForm.options.other')}</span>
                            </label>
                        </div>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary-500" />
                    {t('patientForm.sections.contactInfo')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.phone')} *</label>
                        <input
                            type="tel"
                            {...register('phone')}
                            placeholder="081-234-5678"
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.email')}</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.address')}</label>
                        <textarea
                            {...register('address')}
                            rows="2"
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary-500" />
                    {t('patientForm.sections.emergencyContact')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.contactName')}</label>
                        <input
                            type="text"
                            {...register('emergencyContactName')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.contactPhone')}</label>
                        <input
                            type="tel"
                            {...register('emergencyContactPhone')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Dental Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                    <Smile className="h-5 w-5 text-primary-500" />
                    {t('patientForm.sections.dentalInfo')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.dentalComplaint')}</label>
                        <input
                            type="text"
                            {...register('dentalComplaint')}
                            placeholder={t('patientForm.placeholders.dentalComplaint')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.lastDentalVisit')}</label>
                        <input
                            type="text"
                            {...register('lastDentalVisit')}
                            placeholder={t('patientForm.placeholders.lastDentalVisit')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
            </div>



            {/* Medical Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary-500" />
                    {t('patientForm.sections.medicalInfo')}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.medicalHistory')}</label>
                        <textarea
                            {...register('medicalHistory')}
                            rows="2"
                            placeholder={t('patientForm.placeholders.medicalHistory')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.allergies')}</label>
                        <textarea
                            {...register('allergies')}
                            rows="2"
                            placeholder={t('patientForm.placeholders.allergies')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('patientForm.fields.currentMedications')}</label>
                        <textarea
                            {...register('currentMedications')}
                            rows="2"
                            placeholder={t('patientForm.placeholders.medications')}
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {t('common.confirm')}
                </button>
            </div>
        </form>
    );
};

export default PatientForm;
