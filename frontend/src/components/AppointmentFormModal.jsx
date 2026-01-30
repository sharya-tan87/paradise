import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    X, User, Calendar as CalendarIcon, Clock, Stethoscope,
    FileText, UserCog, Search, Loader2
} from 'lucide-react';
import { searchPatients, getDentists } from '../services/api';

const AppointmentFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    initialData = {},
    isEditMode = false,
    userRole,
    isCreateMode,
    currentUserId
}) => {
    const { t } = useTranslation();
    const [dentists, setDentists] = useState([]);
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Dentist Restriction:
    // If user is a dentist and creating a NEW appointment -> Fixed to themselves (disabled).
    // If user is a dentist and EDITING existing -> Can change (Transfer).
    const isDentistDisabled = userRole === 'dentist' && isCreateMode;

    const schema = yup.object({
        patientHN: yup.string().required(t('appointmentForm.errors.patientRequired')),
        appointmentDate: yup.string().required(t('appointmentForm.errors.dateRequired')),
        startTime: yup.string().required(t('appointmentForm.errors.startTimeRequired')),
        endTime: yup.string()
            .required(t('appointmentForm.errors.endTimeRequired'))
            .test('is-after-start', t('appointmentForm.errors.endTimeAfterStart'), function (value) {
                const { startTime } = this.parent;
                if (!startTime || !value) return true;
                return value > startTime;
            }),
        serviceType: yup.string().required(t('appointmentForm.errors.serviceTypeRequired')),
        dentistId: yup.string().nullable(),
        notes: yup.string().nullable(),
        status: yup.string().oneOf(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    });

    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            status: 'scheduled',
            ...initialData
        }
    });

    // Load Dentists and Reset Form
    useEffect(() => {
        const fetchDentists = async () => {
            try {
                const response = await getDentists();
                if (response.success) {
                    setDentists(response.data);
                }
            } catch (error) {
                console.error('Failed to load dentists', error);
            }
        };

        if (isOpen) {
            // Determine correct dentistId
            let defaultDentistId = initialData.dentistId || '';
            if (userRole === 'dentist' && isCreateMode && currentUserId) {
                defaultDentistId = currentUserId;
            }

            // Reset form with initial data
            reset({
                status: 'scheduled',
                notes: '',
                ...initialData,
                dentistId: defaultDentistId
            });

            fetchDentists();

            // If editing or pre-filled patient info
            if (initialData.patient || initialData.extendedProps?.patient) {
                const patient = initialData.patient || initialData.extendedProps.patient;
                setSelectedPatient(patient);
                setValue('patientHN', patient.hn);
                setSearchQuery(`${patient.firstName} ${patient.lastName}`);
            }
        }
    }, [isOpen, initialData, setValue, reset]);

    // Patient Search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery && !selectedPatient && searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    const response = await searchPatients({ search: searchQuery });
                    if (response.success) {
                        setPatientSearchResults(response.data);
                    }
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setPatientSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedPatient]);

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setValue('patientHN', patient.hn);
        setSearchQuery(`${patient.firstName} ${patient.lastName}`);
        setPatientSearchResults([]);
    };

    const clearPatient = () => {
        setSelectedPatient(null);
        setValue('patientHN', '');
        setSearchQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-primary-900">
                        {isEditMode ? t('appointmentForm.editTitle') : t('appointmentForm.newTitle')}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Patient Search */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.patientLabel')}</label>
                            {selectedPatient ? (
                                <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-lg text-teal-800">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-teal-100 p-2 rounded-full">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                                            <div className="text-xs text-teal-600">HN: {selectedPatient.hn}</div>
                                        </div>
                                    </div>
                                    {!isEditMode && (
                                        <button type="button" onClick={clearPatient} className="text-teal-600 hover:text-teal-800 p-1">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setSelectedPatient(null); }}
                                        placeholder={t('appointmentForm.searchPlaceholder')}
                                        className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 border"
                                    />
                                    {isSearching && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                                        </div>
                                    )}
                                    {/* Search Results Dropdown */}
                                    {patientSearchResults.length > 0 && !selectedPatient && (
                                        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                            {patientSearchResults.map((patient) => (
                                                <div
                                                    key={patient.hn}
                                                    onClick={() => handlePatientSelect(patient)}
                                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="bg-primary-50 p-1.5 rounded-full text-primary-600">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="block truncate font-medium text-gray-900">
                                                            {patient.firstName} {patient.lastName}
                                                        </span>
                                                        <span className="block truncate text-xs text-gray-500">
                                                            {patient.hn} • {patient.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.patientHN && <p className="mt-1 text-xs text-red-500">{errors.patientHN.message}</p>}
                            <input type="hidden" {...register('patientHN')} />
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.dateLabel')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        {...register('appointmentDate')}
                                        className="pl-10 block w-full rounded-lg border-gray-300 border py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                {errors.appointmentDate && <p className="mt-1 text-xs text-red-500">{errors.appointmentDate.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.startLabel')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="time"
                                        {...register('startTime')}
                                        className="pl-10 block w-full rounded-lg border-gray-300 border py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.endLabel')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="time"
                                        {...register('endTime')}
                                        className="pl-10 block w-full rounded-lg border-gray-300 border py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>}
                            </div>
                        </div>

                        {/* Service & Dentist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.serviceTypeLabel')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Stethoscope className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        {...register('serviceType')}
                                        className="pl-10 block w-full rounded-lg border-gray-300 border py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">{t('appointmentForm.selectServicePlaceholder')}</option>
                                        <option value="General Checkup">{t('booking.services.general')}</option>
                                        <option value="Teeth Cleaning">{t('booking.services.cleaning')}</option>
                                        <option value="Cosmetic Dentistry">{t('booking.services.cosmetic')}</option>
                                        <option value="Orthodontics">{t('booking.services.ortho')}</option>
                                        <option value="Dental Implants">{t('booking.services.implants')}</option>
                                        <option value="Other">{t('booking.services.other')}</option>
                                    </select>
                                </div>
                                {errors.serviceType && <p className="mt-1 text-xs text-red-500">{errors.serviceType.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.dentistLabel')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserCog className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        {...register('dentistId')}
                                        tabIndex={isDentistDisabled ? -1 : 0}
                                        className={`pl-10 block w-full rounded-lg border-gray-300 border py-2 text-sm focus:ring-primary-500 focus:border-primary-500 ${isDentistDisabled ? 'bg-gray-100 cursor-not-allowed pointer-events-none' : ''}`}
                                    >
                                        {!isDentistDisabled && <option value="">{t('appointmentForm.anyDentist')}</option>}
                                        {dentists.map(d => (
                                            <option key={d.id} value={d.id}>{d.username}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Status (Edit Mode) */}
                        {isEditMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.statusLabel')}</label>
                                <select
                                    {...register('status')}
                                    className="block w-full rounded-lg border-gray-300 border py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="scheduled">{t('dentistAppointments.status.scheduled')}</option>
                                    <option value="confirmed">{t('dentistAppointments.status.confirmed')}</option>
                                    <option value="in-progress">{t('dentistAppointments.status.inProgress')}</option>
                                    <option value="completed">{t('dentistAppointments.status.completed')}</option>
                                    <option value="cancelled">{t('dentistAppointments.status.cancelled')}</option>
                                    <option value="no-show">{t('dentistAppointments.status.noShow')}</option>
                                </select>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointmentForm.notesLabel')}</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                </div>
                                <textarea
                                    {...register('notes')}
                                    rows="3"
                                    className="pl-10 block w-full rounded-lg border-gray-300 border py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                    placeholder={t('appointmentForm.notesPlaceholder')}
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
                            {isEditMode && onDelete ? (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                                >
                                    {t('appointmentForm.deleteButton')}
                                </button>
                            ) : <div></div>}
                            <div className="flex gap-3">
                                {isEditMode && initialData.status !== 'confirmed' && initialData.status !== 'completed' && initialData.status !== 'cancelled' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedPatient) {
                                                alert(t('appointmentForm.errors.patientRequiredForCheckIn'));
                                                return;
                                            }
                                            setValue('status', 'confirmed');
                                            handleSubmit(onSubmit)();
                                        }}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
                                        {t('common.checkIn')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
                                    {isEditMode ? t('common.save') : t('common.confirm')}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppointmentFormModal;
