import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Edit, UserX, UserCheck, Trash2,
    Shield, Filter, Loader2, CheckCircle, XCircle, Stethoscope
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import UserFormModal from '../components/UserFormModal';
import DentistProfileModal from '../components/DentistProfileModal';
import {
    getAdminUsers, createAdminUser, updateAdminUser,
    deactivateAdminUser, activateAdminUser, deleteAdminUser
} from '../services/api';

const ROLES = [
    { value: 'all', labelKey: 'adminTools.roleFilter.all' },
    { value: 'admin', labelKey: 'staffDashboard.role.admin' },
    { value: 'manager', labelKey: 'staffDashboard.role.manager' },
    { value: 'dentist', labelKey: 'staffDashboard.role.dentist' },
    { value: 'staff', labelKey: 'staffDashboard.role.staff' },
    { value: 'patient', labelKey: 'staffDashboard.role.patient' }
];

const getRoleBadgeClass = (role) => {
    switch (role) {
        case 'admin': return 'bg-purple-100 text-purple-700';
        case 'manager': return 'bg-blue-100 text-blue-700';
        case 'dentist': return 'bg-teal-100 text-teal-700';
        case 'staff': return 'bg-gray-100 text-gray-700';
        case 'patient': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const AdminToolsPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(u);
    }, []);

    const getManageableRoles = () => {
        if (!currentUser) return [];
        if (currentUser.role === 'admin') return ['admin', 'manager', 'dentist', 'staff', 'patient'];
        // Manager can manage dentist, staff, patient
        if (currentUser.role === 'manager') return ['dentist', 'staff', 'patient'];
        // Staff can ONLY manage Dentist and Patient (NOT admin, manager, or other staff)
        if (currentUser.role === 'staff') return ['dentist', 'patient'];

        return [];
    };

    const manageableRoles = getManageableRoles();
    const visibleFilterRoles = ROLES.filter(r => r.value === 'all' || manageableRoles.includes(r.value));

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({ open: false, type: '', user: null });

    // Dentist Profile Modal
    const [dentistProfileModal, setDentistProfileModal] = useState({ open: false, user: null });

    // Success/Error Messages
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (roleFilter !== 'all') params.role = roleFilter;
            if (searchTerm) params.search = searchTerm;

            console.log('🔍 Fetching users with params:', params);
            const res = await getAdminUsers(params);
            console.log('✅ Got response:', res);
            setUsers(res || []);
        } catch (error) {
            console.error('❌ Fetch users error:', error);
            setMessage({ type: 'error', text: error.message || error.error || 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = () => {
        fetchUsers();
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Create/Edit User
    const handleOpenCreateModal = () => {
        setSelectedUser(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (data) => {
        setIsSaving(true);
        try {
            if (selectedUser?.id) {
                await updateAdminUser(selectedUser.id, data);
                showMessage('success', `User ${selectedUser.username} updated successfully`);
            } else {
                await createAdminUser(data);
                showMessage('success', `User ${data.username} created successfully`);
            }
            setIsFormModalOpen(false);
            fetchUsers();
        } catch (error) {
            showMessage('error', error.error || 'Failed to save user');
        } finally {
            setIsSaving(false);
        }
    };

    // Deactivate/Activate User
    const handleDeactivate = async (user) => {
        setConfirmModal({ open: true, type: 'deactivate', user });
    };

    const handleActivate = async (user) => {
        setConfirmModal({ open: true, type: 'activate', user });
    };

    const handleDelete = async (user) => {
        setConfirmModal({ open: true, type: 'delete', user });
    };

    const confirmAction = async () => {
        const { type, user } = confirmModal;
        try {
            if (type === 'deactivate') {
                await deactivateAdminUser(user.id);
                showMessage('success', `User ${user.username} deactivated`);
            } else if (type === 'activate') {
                await activateAdminUser(user.id);
                showMessage('success', `User ${user.username} activated`);
            } else if (type === 'delete') {
                await deleteAdminUser(user.id);
                showMessage('success', `User ${user.username} deleted`);
            }
            fetchUsers();
        } catch (error) {
            showMessage('error', error.error || `Failed to ${type} user`);
        } finally {
            setConfirmModal({ open: false, type: '', user: null });
        }
    };



    return (
        <DashboardLayout title={t('adminTools.title')}>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
                        <Shield className="text-teal-600" />
                        {t('adminTools.title')}
                    </h1>
                    <p className="text-gray-500 mt-1">{t('adminTools.subtitle')}</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} />
                    {t('adminTools.addUser')}
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
                            placeholder={t('adminTools.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none bg-white"
                    >
                        {visibleFilterRoles.map(r => (
                            <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        {t('adminTools.actions.filter')}
                    </button>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">{t('adminTools.table.noUsers')}</h3>
                    <p className="text-gray-500 mt-1">{t('adminTools.table.noUsersDesc')}</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary-50/50 text-primary-900 text-sm border-b border-primary-100">
                                    <th className="px-6 py-4 font-semibold">{t('adminTools.table.user')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('adminTools.table.email')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('adminTools.table.role')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('adminTools.table.status')}</th>
                                    <th className="px-6 py-4 font-semibold text-right">{t('adminTools.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.username}</div>
                                            <div className="text-sm text-gray-500">
                                                {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getRoleBadgeClass(user.role)}`}>
                                                {t(`staffDashboard.role.${user.role}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-sm ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                                                {user.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                {user.active ? t('adminTools.status.active') : t('adminTools.status.inactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenEditModal(user)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title={t('adminTools.actions.edit')}
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                {user.role === 'dentist' && (
                                                    <button
                                                        onClick={() => setDentistProfileModal({ open: true, user })}
                                                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"
                                                        title={t('dentistProfile.editProfile')}
                                                    >
                                                        <Stethoscope size={18} />
                                                    </button>
                                                )}

                                                {user.active ? (
                                                    <button
                                                        onClick={() => handleDeactivate(user)}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                        title={t('adminTools.actions.deactivate')}
                                                    >
                                                        <UserX size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(user)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title={t('adminTools.actions.activate')}
                                                    >
                                                        <UserCheck size={18} />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title={t('adminTools.actions.delete')}
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
                        {users.map((user) => (
                            <div key={user.id} className="bg-white p-5 rounded-xl shadow-sm border border-primary-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{user.username}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getRoleBadgeClass(user.role)}`}>
                                        {t(`staffDashboard.role.${user.role}`)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className={`flex items-center gap-1 text-sm ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        {user.active ? t('adminTools.status.active') : t('adminTools.status.inactive')}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit size={18} />
                                        </button>

                                        {user.role === 'dentist' && (
                                            <button
                                                onClick={() => setDentistProfileModal({ open: true, user })}
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                                                title={t('dentistProfile.editProfile')}
                                            >
                                                <Stethoscope size={18} />
                                            </button>
                                        )}

                                        {user.active ? (
                                            <button onClick={() => handleDeactivate(user)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                                                <UserX size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleActivate(user)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                                <UserCheck size={18} />
                                            </button>
                                        )}

                                        <button onClick={() => handleDelete(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* User Form Modal */}
            <UserFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedUser}
                isLoading={isSaving}
                allowedRoles={manageableRoles}
            />

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {confirmModal.type === 'deactivate' ? t('adminTools.modal.deactivateTitle') :
                                confirmModal.type === 'activate' ? t('adminTools.modal.activateTitle') :
                                    t('adminTools.modal.deleteTitle')}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {confirmModal.type === 'deactivate' ? t('adminTools.modal.confirmDeactivate') :
                                confirmModal.type === 'activate' ? t('adminTools.modal.confirmActivate') :
                                    t('adminTools.modal.confirmDelete')} <strong>{confirmModal.user?.username}</strong>?
                            {confirmModal.type === 'deactivate' && ` ${t('adminTools.modal.deactivateWarning')}`}
                            {confirmModal.type === 'delete' && ` ${t('adminTools.modal.deleteWarning')}`}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal({ open: false, type: '', user: null })}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                            >
                                {t('adminTools.modal.cancel')}
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-4 py-2 rounded-lg font-medium text-white ${confirmModal.type === 'deactivate' ? 'bg-orange-600 hover:bg-orange-700' :
                                    confirmModal.type === 'activate' ? 'bg-green-600 hover:bg-green-700' :
                                        'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {confirmModal.type === 'deactivate' ? t('adminTools.modal.deactivate') :
                                    confirmModal.type === 'activate' ? t('adminTools.modal.activate') :
                                        t('adminTools.modal.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dentist Profile Modal */}
            <DentistProfileModal
                isOpen={dentistProfileModal.open}
                onClose={() => setDentistProfileModal({ open: false, user: null })}
                userId={dentistProfileModal.user?.id}
                userName={dentistProfileModal.user ? `${dentistProfileModal.user.firstName || ''} ${dentistProfileModal.user.lastName || ''}`.trim() || dentistProfileModal.user.username : ''}
            />

        </DashboardLayout>
    );
};

export default AdminToolsPage;
