import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Stethoscope, Eye, Edit, Phone, Filter, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import ViewDetailsModal from '../components/ViewDetailsModal';
import UpdateStatusModal from '../components/UpdateStatusModal';
import CreateRequestModal from '../components/CreateRequestModal';
import { getAppointmentRequests } from '../services/api';

const QueueDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Data States
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter & Pagination States
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal States
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Failed to parse user data", e);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...(statusFilter && statusFilter !== 'all' ? { status: statusFilter } : {})
            };
            const response = await getAppointmentRequests(params);
            if (response.success) {
                setRequests(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalRecords(response.pagination.total);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load appointment requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user, page, statusFilter]);

    const handleStatusUpdate = () => {
        fetchRequests();
    };

    if (!user) return null;

    return (
        <DashboardLayout title={t('queueDashboard.title')}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">{t('queueDashboard.header')}</h1>
                    <p className="text-gray-500 mt-1">{t('queueDashboard.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-primary-100 shadow-sm">
                        <Filter className="h-4 w-4 text-primary-400 ml-2" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="border-none bg-transparent text-sm focus:ring-0 text-primary-900 font-medium py-1 px-2 outline-none"
                        >
                            <option value="">{t('queueDashboard.filter.all')}</option>
                            <option value="pending">{t('queueDashboard.filter.pending')}</option>
                            <option value="contacted">{t('queueDashboard.filter.contacted')}</option>
                            <option value="confirmed">{t('queueDashboard.filter.confirmed')}</option>
                            <option value="cancelled">{t('queueDashboard.filter.cancelled')}</option>
                            <option value="completed">{t('queueDashboard.filter.completed')}</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">{t('queueDashboard.newWalkin') || 'สร้างใหม่'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary-50/50 text-primary-900 text-sm border-b border-primary-100">
                                        <th className="px-6 py-4 font-semibold">{t('queueDashboard.table.requestId')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('queueDashboard.table.patient')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('queueDashboard.table.contact')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('queueDashboard.table.date')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('queueDashboard.table.service')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('queueDashboard.table.dentist') || 'ทันตแพทย์'}</th>
                                        <th className="px-6 py-4 font-semibold">{t('queueDashboard.table.status')}</th>
                                        <th className="px-6 py-4 font-semibold text-right">{t('queueDashboard.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                {t('queueDashboard.table.noData')}
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-primary-900">
                                                    {req.requestId}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {req.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span>{req.phone}</span>
                                                        <span className="text-xs text-gray-400">{req.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(req.preferredDate).toLocaleDateString()}</span>
                                                        <span className="text-xs text-gray-400">{req.preferredTime}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {req.serviceType}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {req.appointment?.dentist ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                                                            👨‍⚕️ {req.appointment.dentist.username}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={req.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(req);
                                                                setIsViewModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                            title={t('queueDashboard.actions.view')}
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(req);
                                                                setIsUpdateModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                            title={t('queueDashboard.actions.update')}
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <a
                                                            href={`tel:${req.phone}`}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title={t('queueDashboard.actions.call')}
                                                        >
                                                            <Phone size={18} />
                                                        </a>
                                                        {req.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => navigate('/dashboard/treatments', { state: { searchTerm: req.name } })}
                                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title={t('queueDashboard.actions.startTreatment')}
                                                            >
                                                                <Stethoscope size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {requests.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                                No requests found.
                            </div>
                        ) : (
                            requests.map((req) => (
                                <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-primary-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                                                {req.requestId}
                                            </span>
                                            <h3 className="font-bold text-gray-900">{req.name}</h3>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>

                                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>{new Date(req.preferredDate).toLocaleDateString()} at {req.preferredTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4 text-gray-400" />
                                            <span>{req.serviceType}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{req.phone}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setIsViewModalOpen(true);
                                            }}
                                            className="flex-1 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setIsUpdateModalOpen(true);
                                            }}
                                            className="flex-1 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100"
                                        >
                                            Update
                                        </button>
                                        {req.status === 'confirmed' && (
                                            <button
                                                onClick={() => navigate('/dashboard/treatments', { state: { searchTerm: req.name } })}
                                                className="flex-1 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                                            >
                                                Treat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
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
                                {t('queueDashboard.pagination', { page: page, total: totalPages })}
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

            <ViewDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                request={selectedRequest}
            />
            <UpdateStatusModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                request={selectedRequest}
                onStatusUpdate={handleStatusUpdate}
            />
            <CreateRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchRequests}
            />
        </DashboardLayout>
    );
};

export default QueueDashboard;
