import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    DollarSign, Plus, Search, FileText, Eye, CreditCard,
    Filter, Calendar, Loader2, ChevronLeft, ChevronRight, Receipt
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import CreateInvoiceModal from '../components/CreateInvoiceModal';
import ViewInvoiceModal from '../components/ViewInvoiceModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import ViewReceiptModal from '../components/ViewReceiptModal';
import { getInvoices, getInvoice } from '../services/api';

const BillingPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [preSelectedPatient, setPreSelectedPatient] = useState(null);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await getInvoices(params);
            setInvoices(res || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();

        // Check for navigation state
        if (location.state?.autoOpen) {
            if (location.state.patient) {
                setPreSelectedPatient(location.state.patient);
            }
            setIsCreateModalOpen(true);
        }
    }, [location.state]);

    const handleSearch = () => {
        fetchInvoices();
    };

    const handleViewInvoice = async (invoice) => {
        try {
            const fullInvoice = await getInvoice(invoice.invoiceNumber);
            setSelectedInvoice(fullInvoice);
            setIsViewModalOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewReceipt = async (invoice) => {
        try {
            const fullInvoice = await getInvoice(invoice.invoiceNumber);
            setSelectedInvoice(fullInvoice);
            setIsReceiptModalOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRecordPayment = async (invoice) => {
        try {
            const fullInvoice = await getInvoice(invoice.invoiceNumber);
            setSelectedInvoice(fullInvoice);
            setIsPaymentModalOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700';
            case 'partially-paid':
                return 'bg-amber-100 text-amber-700';
            case 'unpaid':
            default:
                return 'bg-red-100 text-red-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'paid': return t('billingPage.status.paid');
            case 'partially-paid': return t('billingPage.status.partially-paid');
            case 'unpaid': return t('billingPage.status.unpaid');
            default: return status;
        }
    };

    // Summary calculations
    const totalUnpaid = invoices.filter(i => i.paymentStatus === 'unpaid').reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);
    const totalPaid = invoices.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);

    return (
        <DashboardLayout title={t('billingPage.title')}>
            <div className="flex flex-col h-full">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
                            <DollarSign className="text-teal-600" />
                            {t('billingPage.title')}
                        </h1>
                        <p className="text-gray-500 mt-1">{t('billingPage.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus size={20} />
                        {t('billingPage.createInvoice')}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl border border-primary-100 shadow-sm">
                        <p className="text-gray-500 text-sm">{t('billingPage.totalInvoices')}</p>
                        <p className="text-3xl font-bold text-primary-900">{invoices.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200">
                        <p className="text-red-600 text-sm font-medium">{t('billingPage.unpaidAmount')}</p>
                        <p className="text-3xl font-bold text-red-700">฿{totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                        <p className="text-green-600 text-sm font-medium">{t('billingPage.collected')}</p>
                        <p className="text-3xl font-bold text-green-700">฿{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder={t('billingPage.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none bg-white"
                        >
                            <option value="all">{t('billingPage.status.all')}</option>
                            <option value="unpaid">{t('billingPage.status.unpaid')}</option>
                            <option value="partially-paid">{t('billingPage.status.partially-paid')}</option>
                            <option value="paid">{t('billingPage.status.paid')}</option>
                        </select>

                        {/* Date Range */}
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            {t('billingPage.apply')}
                        </button>
                    </div>
                </div>

                {/* Invoices Table / Cards */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">{t('billingPage.noInvoices')}</h3>
                        <p className="text-gray-500 mt-1">{t('billingPage.noInvoicesDesc')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary-50/50 text-primary-900 text-sm border-b border-primary-100">
                                        <th className="px-6 py-4 font-semibold">{t('billingPage.table.invoiceNo')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('billingPage.table.patient')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('billingPage.table.date')}</th>
                                        <th className="px-6 py-4 font-semibold text-right">{t('billingPage.table.amount')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('billingPage.table.status')}</th>
                                        <th className="px-6 py-4 font-semibold text-right">{t('billingPage.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded font-medium">
                                                    {invoice.invoiceNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {invoice.patient?.firstName} {invoice.patient?.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">{invoice.patientHN}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(invoice.invoiceDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                                                ฿{parseFloat(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeClass(invoice.paymentStatus)}`}>
                                                    {getStatusLabel(invoice.paymentStatus)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    {invoice.paymentStatus === 'paid' && (
                                                        <button
                                                            onClick={() => handleViewReceipt(invoice)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Receipt"
                                                        >
                                                            <Receipt size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleViewInvoice(invoice)}
                                                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                        title="View Invoice"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {invoice.paymentStatus !== 'paid' && (
                                                        <button
                                                            onClick={() => handleRecordPayment(invoice)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Record Payment"
                                                        >
                                                            <CreditCard size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="bg-white p-5 rounded-xl shadow-sm border border-primary-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                                {invoice.invoiceNumber}
                                            </span>
                                            <h3 className="font-bold text-gray-900 mt-2">
                                                {invoice.patient?.firstName} {invoice.patient?.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeClass(invoice.paymentStatus)}`}>
                                            {getStatusLabel(invoice.paymentStatus)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <span className="font-mono font-bold text-lg text-primary-900">
                                            ฿{parseFloat(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                        <div className="flex gap-2">
                                            {invoice.paymentStatus === 'paid' && (
                                                <button
                                                    onClick={() => handleViewReceipt(invoice)}
                                                    className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                                                >
                                                    Receipt
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewInvoice(invoice)}
                                                className="px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100"
                                            >
                                                View
                                            </button>
                                            {invoice.paymentStatus !== 'paid' && (
                                                <button
                                                    onClick={() => handleRecordPayment(invoice)}
                                                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                                                >
                                                    {t('billingPage.actions.pay')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Modals */}
                <CreateInvoiceModal
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setPreSelectedPatient(null);
                    }}
                    onSuccess={() => fetchInvoices()}
                    initialPatient={preSelectedPatient}
                />
                <ViewInvoiceModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    invoice={selectedInvoice}
                />
                <ViewReceiptModal
                    isOpen={isReceiptModalOpen}
                    onClose={() => setIsReceiptModalOpen(false)}
                    invoice={selectedInvoice}
                />
                <RecordPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    invoice={selectedInvoice}
                    onSuccess={() => fetchInvoices()}
                />
            </div>
        </DashboardLayout>
    );
};

export default BillingPage;
