import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    X, Save, Loader2, User, Award, GraduationCap, Stethoscope,
    Plus, Trash2, Clock, Calendar, BadgeCheck, Camera
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    getDentistProfileByUserId, upsertDentistProfile,
    getServices, getSpecializations
} from '../services/api';

const DentistProfileModal = ({ isOpen, onClose, userId, userName }) => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [services, setServices] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            licenseNumber: '',
            specializations: [],
            certificates: [],
            education: [],
            experience: '',
            bio: '',
            bioTh: '',
            consultationFee: '',
            availableDays: [1, 2, 3, 4, 5],
            workingHours: { start: '09:00', end: '17:00' },
            serviceIds: []
        }
    });

    const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
        control,
        name: 'certificates'
    });

    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
        control,
        name: 'education'
    });

    const watchedDays = watch('availableDays');
    const watchedServiceIds = watch('serviceIds');

    const DAYS = [
        { value: 1, label: 'Mon', labelTh: 'จ.' },
        { value: 2, label: 'Tue', labelTh: 'อ.' },
        { value: 3, label: 'Wed', labelTh: 'พ.' },
        { value: 4, label: 'Thu', labelTh: 'พฤ.' },
        { value: 5, label: 'Fri', labelTh: 'ศ.' },
        { value: 6, label: 'Sat', labelTh: 'ส.' },
        { value: 0, label: 'Sun', labelTh: 'อา.' }
    ];

    useEffect(() => {
        if (isOpen && userId) {
            loadData();
        }
    }, [isOpen, userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load services and specializations in parallel
            const [servicesRes, specializationsRes] = await Promise.all([
                getServices({ active: true }),
                getSpecializations()
            ]);

            setServices(servicesRes || []);
            setSpecializations(specializationsRes || []);

            // Try to load existing profile
            try {
                const profile = await getDentistProfileByUserId(userId);
                if (profile) {
                    reset({
                        licenseNumber: profile.licenseNumber || '',
                        specializations: profile.specializations || [],
                        certificates: profile.certificates || [],
                        education: profile.education || [],
                        experience: profile.experience || '',
                        bio: profile.bio || '',
                        bioTh: profile.bioTh || '',
                        consultationFee: profile.consultationFee || '',
                        availableDays: profile.availableDays || [1, 2, 3, 4, 5],
                        workingHours: profile.workingHours || { start: '09:00', end: '17:00' },
                        serviceIds: profile.services?.map(s => s.id) || []
                    });

                    if (profile.imagePath) {
                        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
                        const host = API_BASE.replace('/api', '');
                        setPreviewImage(`${host}${profile.imagePath}`);
                    }
                }
            } catch (err) {
                // Profile doesn't exist yet, use defaults
                console.log('No existing profile, using defaults');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'error', text: t('dentistProfile.error.loadFailed') });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const formData = new FormData();

            // Append regular fields
            Object.keys(data).forEach(key => {
                if (['availableDays', 'workingHours', 'serviceIds', 'specializations', 'certificates', 'education'].includes(key)) {
                    formData.append(key, JSON.stringify(data[key]));
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await upsertDentistProfile(userId, formData);
            setMessage({ type: 'success', text: t('dentistProfile.success.saved') });
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: error.error || t('dentistProfile.error.saveFailed') });
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day) => {
        const current = watchedDays || [];
        if (current.includes(day)) {
            setValue('availableDays', current.filter(d => d !== day));
        } else {
            setValue('availableDays', [...current, day].sort((a, b) => a - b));
        }
    };

    const toggleService = (serviceId) => {
        const current = watchedServiceIds || [];
        if (current.includes(serviceId)) {
            setValue('serviceIds', current.filter(id => id !== serviceId));
        } else {
            setValue('serviceIds', [...current, serviceId]);
        }
    };

    const toggleSpecialization = (spec) => {
        const current = watch('specializations') || [];
        if (current.includes(spec)) {
            setValue('specializations', current.filter(s => s !== spec));
        } else {
            setValue('specializations', [...current, spec]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-50 p-2 rounded-lg">
                            <User className="text-teal-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary-900">
                                {t('dentistProfile.title')}
                            </h2>
                            <p className="text-sm text-gray-500">{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Message */}
                            {message.text && (
                                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Basic Info */}
                            <div className="flex justify-center mb-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={64} className="text-gray-300" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full text-white shadow-md cursor-pointer hover:bg-teal-700 transition-colors">
                                        <Camera size={20} />
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
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BadgeCheck size={18} className="text-teal-600" />
                                    {t('dentistProfile.section.basicInfo')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('dentistProfile.form.licenseNumber')}
                                        </label>
                                        <input
                                            type="text"
                                            {...register('licenseNumber')}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                            placeholder="ท.1234"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('dentistProfile.form.consultationFee')}
                                        </label>
                                        <input
                                            type="number"
                                            {...register('consultationFee')}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                            placeholder="500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award size={18} className="text-teal-600" />
                                    {t('dentistProfile.section.specializations')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {specializations.map(spec => (
                                        <button
                                            key={spec.value}
                                            type="button"
                                            onClick={() => toggleSpecialization(spec.value)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${watch('specializations')?.includes(spec.value)
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:border-teal-400'
                                                }`}
                                        >
                                            {i18n.language === 'th' ? spec.labelTh : spec.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Services Offered */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Stethoscope size={18} className="text-teal-600" />
                                    {t('dentistProfile.section.services')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                    {services.map(service => (
                                        <label
                                            key={service.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${watchedServiceIds?.includes(service.id)
                                                ? 'bg-teal-50 border border-teal-300'
                                                : 'bg-white border border-gray-200 hover:border-teal-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={watchedServiceIds?.includes(service.id) || false}
                                                onChange={() => toggleService(service.id)}
                                                className="rounded text-teal-600 focus:ring-teal-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {i18n.language === 'th' && service.nameTh ? service.nameTh : service.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Certificates */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Award size={18} className="text-teal-600" />
                                        {t('dentistProfile.section.certificates')}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => appendCert({ name: '', issuedBy: '', issuedDate: '', expiryDate: '' })}
                                        className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} /> {t('dentistProfile.form.addCertificate')}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {certFields.map((field, index) => (
                                        <div key={field.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <input
                                                    {...register(`certificates.${index}.name`)}
                                                    placeholder={t('dentistProfile.form.certName')}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                />
                                                <input
                                                    {...register(`certificates.${index}.issuedBy`)}
                                                    placeholder={t('dentistProfile.form.issuedBy')}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                />
                                                <input
                                                    {...register(`certificates.${index}.issuedDate`)}
                                                    type="date"
                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        {...register(`certificates.${index}.expiryDate`)}
                                                        type="date"
                                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCert(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {certFields.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            {t('dentistProfile.form.noCertificates')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Education */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <GraduationCap size={18} className="text-teal-600" />
                                        {t('dentistProfile.section.education')}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => appendEdu({ degree: '', institution: '', year: '' })}
                                        className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} /> {t('dentistProfile.form.addEducation')}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {eduFields.map((field, index) => (
                                        <div key={field.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <input
                                                    {...register(`education.${index}.degree`)}
                                                    placeholder={t('dentistProfile.form.degree')}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                />
                                                <input
                                                    {...register(`education.${index}.institution`)}
                                                    placeholder={t('dentistProfile.form.institution')}
                                                    className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        {...register(`education.${index}.year`)}
                                                        type="number"
                                                        placeholder={t('dentistProfile.form.year')}
                                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEdu(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {eduFields.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            {t('dentistProfile.form.noEducation')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Working Schedule */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock size={18} className="text-teal-600" />
                                    {t('dentistProfile.section.schedule')}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('dentistProfile.form.availableDays')}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS.map(day => (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => toggleDay(day.value)}
                                                    className={`w-12 h-10 rounded-lg font-medium transition-all ${watchedDays?.includes(day.value)
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:border-teal-400'
                                                        }`}
                                                >
                                                    {i18n.language === 'th' ? day.labelTh : day.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('dentistProfile.form.startTime')}
                                            </label>
                                            <input
                                                type="time"
                                                {...register('workingHours.start')}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('dentistProfile.form.endTime')}
                                            </label>
                                            <input
                                                type="time"
                                                {...register('workingHours.end')}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    {t('dentistProfile.section.bio')}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('dentistProfile.form.bio')} (English)
                                        </label>
                                        <textarea
                                            {...register('bio')}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none"
                                            placeholder="Professional bio..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('dentistProfile.form.bio')} (ภาษาไทย)
                                        </label>
                                        <textarea
                                            {...register('bioTh')}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none"
                                            placeholder="ประวัติ..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('dentistProfile.form.experience')}
                                        </label>
                                        <textarea
                                            {...register('experience')}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none"
                                            placeholder="Work experience and achievements..."
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
                                {t('dentistProfile.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {t('dentistProfile.save')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DentistProfileModal;
