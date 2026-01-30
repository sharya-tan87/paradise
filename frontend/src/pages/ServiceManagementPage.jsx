import React, { useState, useEffect } from 'react';
import {
    Stethoscope, Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight,
    Filter, Loader2, CheckCircle, XCircle, Clock, DollarSign, Tag
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import {
    getServices, createService, updateService, deleteService, toggleServiceStatus
} from '../services/api';

const CATEGORIES = [
    { value: 'all', labelKey: 'serviceManagement.category.all' },
    { value: 'general', labelKey: 'serviceManagement.category.general' },
    { value: 'cosmetic', labelKey: 'serviceManagement.category.cosmetic' },
    { value: 'orthodontics', labelKey: 'serviceManagement.category.orthodontics' },
    { value: 'surgical', labelKey: 'serviceManagement.category.surgical' },
    { value: 'preventive', labelKey: 'serviceManagement.category.preventive' },
    { value: 'restorative', labelKey: 'serviceManagement.category.restorative' },
    { value: 'pediatric', labelKey: 'serviceManagement.category.pediatric' }
];

const getCategoryBadgeClass = (category) => {
    switch (category) {
        case 'general': return 'bg-blue-100 text-blue-700';
        case 'cosmetic': return 'bg-pink-100 text-pink-700';
        case 'orthodontics': return 'bg-purple-100 text-purple-700';
        case 'surgical': return 'bg-red-100 text-red-700';
        case 'preventive': return 'bg-green-100 text-green-700';
        case 'restorative': return 'bg-orange-100 text-orange-700';
        case 'pediatric': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const ServiceManagementPage = () => {
    const { t, i18n } = useTranslation();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Delete Confirmation Modal
    const [deleteModal, setDeleteModal] = useState({ open: false, service: null });

    // Success/Error Messages
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchServices = async () => {
        setLoading(true);
        try {
            const params = {};
            if (categoryFilter !== 'all') params.category = categoryFilter;
            if (searchTerm) params.search = searchTerm;

            const res = await getServices(params);
            setServices(res || []);
        } catch (error) {
            console.error('Fetch services error:', error);
            setMessage({ type: 'error', text: error.message || t('serviceManagement.error.loadFailed') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSearch = () => {
        fetchServices();
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Create/Edit Service
    const handleOpenCreateModal = () => {
        setSelectedService(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (service) => {
        setSelectedService(service);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (data) => {
        setIsSaving(true);
        try {
            if (selectedService?.id) {
                await updateService(selectedService.id, data);
                showMessage('success', t('serviceManagement.success.updated'));
            } else {
                await createService(data);
                showMessage('success', t('serviceManagement.success.created'));
            }
            setIsFormModalOpen(false);
            fetchServices();
        } catch (error) {
            showMessage('error', error.error || t('serviceManagement.error.saveFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (service) => {
        try {
            await toggleServiceStatus(service.id);
            showMessage('success', service.active ? t('serviceManagement.success.disabled') : t('serviceManagement.success.enabled'));
            fetchServices();
        } catch (error) {
            showMessage('error', error.error || t('serviceManagement.error.toggleFailed'));
        }
    };

    const handleDelete = async (service) => {
        setDeleteModal({ open: true, service });
    };

    const confirmDelete = async () => {
        try {
            await deleteService(deleteModal.service.id);
            showMessage('success', t('serviceManagement.success.deleted'));
            fetchServices();
        } catch (error) {
            showMessage('error', error.error || t('serviceManagement.error.deleteFailed'));
        } finally {
            setDeleteModal({ open: false, service: null });
        }
    };

    const formatPrice = (price) => {
        if (!price) return '-';
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price);
    };

    return (
        <DashboardLayout title={t('serviceManagement.title')}>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
                        <Stethoscope className="text-teal-600" />
                        {t('serviceManagement.title')}
                    </h1>
                    <p className="text-gray-500 mt-1">{t('serviceManagement.subtitle')}</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} />
                    {t('serviceManagement.addService')}
                </button>
            </div>

            {/* Success/Error Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder={t('serviceManagement.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none bg-white"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        {t('serviceManagement.filter')}
                    </button>
                </div>
            </div>

            {/* Services Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">{t('serviceManagement.noServices')}</h3>
                    <p className="text-gray-500 mt-1">{t('serviceManagement.noServicesDesc')}</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary-50/50 text-primary-900 text-sm border-b border-primary-100">
                                    <th className="px-6 py-4 font-semibold">{t('serviceManagement.table.name')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('serviceManagement.table.category')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('serviceManagement.table.price')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('serviceManagement.table.duration')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('serviceManagement.table.status')}</th>
                                    <th className="px-6 py-4 font-semibold text-right">{t('serviceManagement.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {i18n.language === 'th' && service.nameTh ? service.nameTh : service.name}
                                            </div>
                                            {service.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {i18n.language === 'th' && service.descriptionTh ? service.descriptionTh : service.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getCategoryBadgeClass(service.category)}`}>
                                                {t(`serviceManagement.category.${service.category}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {formatPrice(service.basePrice)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {service.duration} {t('serviceManagement.minutes')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-sm ${service.active ? 'text-green-600' : 'text-red-600'}`}>
                                                {service.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                {service.active ? t('serviceManagement.status.active') : t('serviceManagement.status.inactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenEditModal(service)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title={t('serviceManagement.actions.edit')}
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(service)}
                                                    className={`p-1.5 rounded-lg ${service.active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={service.active ? t('serviceManagement.actions.disable') : t('serviceManagement.actions.enable')}
                                                >
                                                    {service.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(service)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title={t('serviceManagement.actions.delete')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {services.map((service) => (
                            <div key={service.id} className="bg-white p-5 rounded-xl shadow-sm border border-primary-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            {i18n.language === 'th' && service.nameTh ? service.nameTh : service.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{formatPrice(service.basePrice)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getCategoryBadgeClass(service.category)}`}>
                                        {t(`serviceManagement.category.${service.category}`)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className={`flex items-center gap-1 text-sm ${service.active ? 'text-green-600' : 'text-red-600'}`}>
                                        {service.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        {service.active ? t('serviceManagement.status.active') : t('serviceManagement.status.inactive')}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenEditModal(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(service)}
                                            className={`p-2 rounded-lg ${service.active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                        >
                                            {service.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                        </button>
                                        <button onClick={() => handleDelete(service)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Service Form Modal */}
            {isFormModalOpen && (
                <ServiceFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    initialData={selectedService}
                    isLoading={isSaving}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {t('serviceManagement.modal.deleteTitle')}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {t('serviceManagement.modal.deleteConfirm')} <strong>{deleteModal.service?.name}</strong>?
                            {' '}{t('serviceManagement.modal.deleteWarning')}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, service: null })}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                            >
                                {t('serviceManagement.modal.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                {t('serviceManagement.modal.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

// Service Form Modal Component
const ServiceFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const { t } = useTranslation();
    const isEditMode = !!initialData?.id;

    const [formData, setFormData] = useState({
        name: '',
        nameTh: '',
        description: '',
        descriptionTh: '',
        category: 'general',
        basePrice: '',
        duration: 30,
        active: true,
        sortOrder: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                nameTh: initialData.nameTh || '',
                description: initialData.description || '',
                descriptionTh: initialData.descriptionTh || '',
                category: initialData.category || 'general',
                basePrice: initialData.basePrice || '',
                duration: initialData.duration || 30,
                active: initialData.active !== false,
                sortOrder: initialData.sortOrder || 0
            });
        } else {
            setFormData({
                name: '',
                nameTh: '',
                description: '',
                descriptionTh: '',
                category: 'general',
                basePrice: '',
                duration: 30,
                active: true,
                sortOrder: 0
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
            duration: parseInt(formData.duration) || 30,
            sortOrder: parseInt(formData.sortOrder) || 0
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-50 p-2 rounded-lg">
                            <Stethoscope className="text-teal-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-primary-900">
                            {isEditMode ? t('serviceManagement.modal.editTitle') : t('serviceManagement.modal.createTitle')}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name (English) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('serviceManagement.form.name')} *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                placeholder="e.g., Teeth Cleaning"
                            />
                        </div>

                        {/* Name (Thai) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('serviceManagement.form.nameTh')}
                            </label>
                            <input
                                type="text"
                                name="nameTh"
                                value={formData.nameTh}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                placeholder="เช่น ขูดหินปูน"
                            />
                        </div>
                    </div>

                    {/* Description (English) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('serviceManagement.form.description')}
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none"
                            placeholder="Brief description of the service..."
                        />
                    </div>

                    {/* Description (Thai) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('serviceManagement.form.descriptionTh')}
                        </label>
                        <textarea
                            name="descriptionTh"
                            value={formData.descriptionTh}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none"
                            placeholder="รายละเอียดบริการ..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('serviceManagement.form.category')} *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none bg-white"
                            >
                                {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                                    <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Base Price */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('serviceManagement.form.basePrice')}
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    name="basePrice"
                                    value={formData.basePrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('serviceManagement.form.duration')}
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min="5"
                                    step="5"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                    placeholder="30"
                                />
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{t('serviceManagement.minutes')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('serviceManagement.form.sortOrder')}
                            </label>
                            <input
                                type="number"
                                name="sortOrder"
                                value={formData.sortOrder}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {t('serviceManagement.form.active')}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            {t('serviceManagement.modal.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                            {isEditMode ? t('serviceManagement.modal.save') : t('serviceManagement.modal.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceManagementPage;
