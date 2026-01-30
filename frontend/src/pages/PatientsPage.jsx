import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Edit, Trash2, Eye, User, Phone,
    ChevronLeft, ChevronRight, AlertTriangle, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import PatientForm from '../components/PatientForm';
import ViewPatientModal from '../components/ViewPatientModal';
import { searchPatients, createPatient, updatePatient, deletePatient } from '../services/api';

const PatientsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Data & UI State
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Verify Auth
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Fetch Patients
    const fetchPatients = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                search: searchTerm
            };
            const response = await searchPatients(params);
            if (response.success) {
                setPatients(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalRecords(response.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch patients', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPatients();
        }
    }, [user, page]); // Re-fetch on page change, search is manual

    // Actions
    const handleCreate = async (data) => {
        setActionLoading(true);
        try {
            await createPatient(data);
            setIsCreateModalOpen(false);
            fetchPatients();
        } catch (error) {
            alert(error.message || 'Failed to create patient');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (data) => {
        setActionLoading(true);
        try {
            await updatePatient(selectedPatient.hn, data);
            setIsEditModalOpen(false);
            fetchPatients();
        } catch (error) {
            alert(error.message || 'Failed to update patient');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await deletePatient(selectedPatient.hn);
            setIsDeleteModalOpen(false);
            fetchPatients();
        } catch (error) {
            alert(error.message || 'Failed to delete patient');
        } finally {
            setActionLoading(false);
        }
    };

    if (!user) return null;

    return (
        <DashboardLayout title={t('patientsPage.title')}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 flex items-center gap-3">
                        {t('patientsPage.title')}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {totalRecords}
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-1">{t('patientsPage.subtitle')}</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} />
                    {t('patientsPage.newPatient')}
                </button>
            </div>

            {/* Search & Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder={t('patientsPage.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchPatients())}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                    />
                </div>
                <button
                    onClick={() => { setPage(1); fetchPatients(); }}
                    className="px-6 py-2.5 bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition-colors border border-primary-100"
                >
                    {t('patientsPage.search')}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
                </div>
            ) : patients.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">{t('patientsPage.noData')}</h3>
                    <p className="text-gray-500 mt-1">{t('patientsPage.noDataDesc')}</p>
                </div>
            ) : (
                <>
                    {/* Table View (Desktop) */}
                    <div className="hidden md:block bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary-50/50 text-primary-900 text-sm border-b border-primary-100">
                                    <th className="px-6 py-4 font-semibold">{t('patientsPage.table.hn')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('patientsPage.table.name')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('patientsPage.table.ageGender')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('patientsPage.table.contact')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('patientsPage.table.registered')}</th>
                                    <th className="px-6 py-4 font-semibold text-right">{t('patientsPage.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {patients.map((patient) => (
                                    <tr key={patient.hn} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded font-medium">
                                                {patient.hn}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{patient.title} {patient.firstName} {patient.lastName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                            {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs / {patient.gender}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900">{patient.phone}</span>
                                                <span className="text-xs">{patient.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(patient.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedPatient(patient); setIsViewModalOpen(true); }}
                                                    className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title={t('queueDashboard.actions.view')}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={t('queueDashboard.actions.update')}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedPatient(patient); setIsDeleteModalOpen(true); }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={t('patientsPage.modal.deactivate')}
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

                    {/* Card View (Mobile) */}
                    <div className="md:hidden space-y-4">
                        {patients.map((patient) => (
                            <div key={patient.hn} className="bg-white p-5 rounded-xl shadow-sm border border-primary-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-2 inline-block">
                                            {patient.hn}
                                        </span>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {patient.firstName} {patient.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">
                                            {patient.gender} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{patient.phone}</span>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => { setSelectedPatient(patient); setIsViewModalOpen(true); }}
                                        className="flex-1 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100"
                                    >
                                        {t('queueDashboard.actions.view')}
                                    </button>
                                    <button
                                        onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}
                                        className="flex-1 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                                    >
                                        {t('queueDashboard.actions.update')}
                                    </button>
                                    <button
                                        onClick={() => { setSelectedPatient(patient); setIsDeleteModalOpen(true); }}
                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsCreateModalOpen(false)}
                >
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 p-6 animate-in fade-in zoom-in-95 duration-200 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-primary-900 mb-6">{t('patientsPage.modal.createTitle')}</h2>
                            <PatientForm
                                onSubmit={handleCreate}
                                onCancel={() => setIsCreateModalOpen(false)}
                                isLoading={actionLoading}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedPatient && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 p-6 animate-in fade-in zoom-in-95 duration-200 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-primary-900">{t('patientsPage.modal.editTitle')}</h2>
                                <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded">
                                    {selectedPatient.hn}
                                </span>
                            </div>
                            <PatientForm
                                initialData={selectedPatient}
                                onSubmit={handleUpdate}
                                onCancel={() => setIsEditModalOpen(false)}
                                isLoading={actionLoading}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            <ViewPatientModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                patient={selectedPatient}
            />

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedPatient && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsDeleteModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="bg-red-50 p-3 rounded-full">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{t('patientsPage.modal.deleteTitle')}</h2>
                        </div>

                        <p className="text-gray-600 mb-6">
                            {t('patientsPage.modal.deleteConfirm')} <span className="font-bold text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</span> ({selectedPatient.hn})?
                            {t('patientsPage.modal.deleteWarning')}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                disabled={actionLoading}
                            >
                                {t('patientsPage.modal.cancel')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
                                disabled={actionLoading}
                            >
                                {actionLoading && <Loader2 className="animate-spin w-4 h-4" />}
                                {t('patientsPage.modal.deactivate')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PatientsPage;
