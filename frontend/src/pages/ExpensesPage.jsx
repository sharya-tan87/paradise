import React, { useState, useEffect } from 'react';
import {
    DollarSign, Package, Plus, Search, Filter, Loader2,
    Trash2, Edit, AlertCircle, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import ExpenseFormModal from '../components/ExpenseFormModal';
import InventoryFormModal from '../components/InventoryFormModal';
import {
    getExpenses, createExpense, updateExpense, deleteExpense,
    getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem
} from '../services/api';

const CATEGORIES = [
    'Salaries', 'Supplies', 'Utilities', 'Rent', 'Equipment', 'Marketing', 'Other'
];

const ExpensesPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'inventory'
    const [loading, setLoading] = useState(true);

    // Expense State
    const [expenses, setExpenses] = useState([]);
    const [expenseFilters, setExpenseFilters] = useState({
        category: '',
        startDate: '',
        endDate: ''
    });

    // Inventory State
    const [inventory, setInventory] = useState([]);
    const [inventorySearch, setInventorySearch] = useState('');
    const [lowStockFilter, setLowStockFilter] = useState(false);

    // Modals
    const [expenseModal, setExpenseModal] = useState({ open: false, data: null });
    const [inventoryModal, setInventoryModal] = useState({ open: false, data: null });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (expenseFilters.category) params.category = expenseFilters.category;
            if (expenseFilters.startDate) params.startDate = expenseFilters.startDate;
            if (expenseFilters.endDate) params.endDate = expenseFilters.endDate;
            const res = await getExpenses(params);
            setExpenses(res || []);
        } catch (error) {
            showMessage('error', 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const params = {};
            if (lowStockFilter) params.lowStock = 'true';
            const res = await getInventory(params);
            // Client-side search for simplicity if API doesn't support generic search
            let data = res || [];
            if (inventorySearch) {
                const searchLower = inventorySearch.toLowerCase();
                data = data.filter(item => item.itemName.toLowerCase().includes(searchLower));
            }
            setInventory(data);
        } catch (error) {
            showMessage('error', 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'expenses') {
            fetchExpenses();
        } else {
            fetchInventory();
        }
    }, [activeTab, expenseFilters, lowStockFilter]);

    // Re-filter inventory when search changes locally
    useEffect(() => {
        if (activeTab === 'inventory' && !loading) {
            fetchInventory();
        }
    }, [inventorySearch]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // --- Expense Actions ---
    const handleSaveExpense = async (data) => {
        setIsSaving(true);
        try {
            if (expenseModal.data?.id) {
                await updateExpense(expenseModal.data.id, data);
                showMessage('success', 'Expense updated successfully');
            } else {
                await createExpense(data);
                showMessage('success', 'Expense added successfully');
            }
            setExpenseModal({ open: false, data: null });
            fetchExpenses();
        } catch (error) {
            showMessage('error', 'Failed to save expense');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await deleteExpense(id);
            showMessage('success', 'Expense deleted');
            fetchExpenses();
        } catch (error) {
            showMessage('error', 'Failed to delete expense');
        }
    };

    // --- Inventory Actions ---
    const handleSaveInventory = async (data) => {
        setIsSaving(true);
        try {
            if (inventoryModal.data?.id) {
                await updateInventoryItem(inventoryModal.data.id, data);
                showMessage('success', 'Item updated successfully');
            } else {
                await createInventoryItem(data);
                showMessage('success', 'Item added successfully');
            }
            setInventoryModal({ open: false, data: null });
            fetchInventory();
        } catch (error) {
            showMessage('error', 'Failed to save item');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteInventory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteInventoryItem(id);
            showMessage('success', 'Item deleted');
            fetchInventory();
        } catch (error) {
            showMessage('error', 'Failed to delete item');
        }
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    return (
        <DashboardLayout title={t('expenseInventory.title')}>
            <div className="flex flex-col h-full">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
                            {activeTab === 'expenses' ? <DollarSign className="text-teal-600" /> : <Package className="text-teal-600" />}
                            {t('expenseInventory.title')}
                        </h1>
                        <p className="text-gray-500 mt-1">{t('expenseInventory.subtitle')}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'expenses'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('expenseInventory.tabs.expenses')}
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'inventory'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('expenseInventory.tabs.inventory')}
                    </button>
                </div>

                {/* Success/Error Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* EXPENSES CONTENT */}
                {activeTab === 'expenses' && (
                    <>
                        {/* Filters & Actions */}
                        <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-end">
                            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500">{t('expenseInventory.filters.category')}</label>
                                    <select
                                        value={expenseFilters.category}
                                        onChange={(e) => setExpenseFilters(prev => ({ ...prev, category: e.target.value }))}
                                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-teal-500 text-sm bg-white"
                                    >
                                        <option value="">{t('expenseInventory.filters.allCategories')}</option>
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500">{t('expenseInventory.filters.startDate')}</label>
                                    <input
                                        type="date"
                                        value={expenseFilters.startDate}
                                        onChange={(e) => setExpenseFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-teal-500 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500">{t('expenseInventory.filters.endDate')}</label>
                                    <input
                                        type="date"
                                        value={expenseFilters.endDate}
                                        onChange={(e) => setExpenseFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-teal-500 text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => setExpenseModal({ open: true, data: null })}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
                            >
                                <Plus size={20} />
                                {t('expenseInventory.addExpense')}
                            </button>
                        </div>

                        {/* Totals */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-primary-100">
                                <p className="text-gray-500 text-sm font-medium">{t('expenseInventory.totalExpenses')}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">฿{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary-50/50 text-gray-700 text-sm border-b border-primary-100">
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.expensesTable.date')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.expensesTable.category')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.expensesTable.description')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.expensesTable.vendor')}</th>
                                        <th className="px-6 py-4 font-semibold text-right">{t('expenseInventory.expensesTable.amount')}</th>
                                        <th className="px-6 py-4 font-semibold text-right">{t('expenseInventory.expensesTable.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-10"><Loader2 className="animate-spin inline text-teal-600" /></td></tr>
                                    ) : expenses.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-10 text-gray-400">{t('expenseInventory.expensesTable.noData')}</td></tr>
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900">{exp.expenseDate}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{exp.category}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{exp.description}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{exp.vendor || '-'}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">฿{parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setExpenseModal({ open: true, data: exp })} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* INVENTORY CONTENT */}
                {activeTab === 'inventory' && (
                    <>
                        <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex flex-col md:flex-row gap-4 flex-grow">
                                <div className="relative flex-grow max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder={t('expenseInventory.filters.searchInventory')}
                                        value={inventorySearch}
                                        onChange={(e) => setInventorySearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={lowStockFilter}
                                        onChange={(e) => setLowStockFilter(e.target.checked)}
                                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{t('expenseInventory.filters.lowStock')}</span>
                                </label>
                            </div>
                            <button
                                onClick={() => setInventoryModal({ open: true, data: null })}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
                            >
                                <Plus size={20} />
                                {t('expenseInventory.addItem')}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary-50/50 text-gray-700 text-sm border-b border-primary-100">
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.inventoryTable.itemName')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.inventoryTable.quantity')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.inventoryTable.reorderLevel')}</th>
                                        <th className="px-6 py-4 font-semibold">{t('expenseInventory.inventoryTable.supplier')}</th>
                                        <th className="px-6 py-4 font-semibold text-right">{t('expenseInventory.inventoryTable.unitCost')}</th>
                                        <th className="px-6 py-4 font-semibold text-right">{t('expenseInventory.inventoryTable.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-10"><Loader2 className="animate-spin inline text-teal-600" /></td></tr>
                                    ) : inventory.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-10 text-gray-400">{t('expenseInventory.inventoryTable.noData')}</td></tr>
                                    ) : (
                                        inventory.map(item => {
                                            const isLow = item.quantity <= item.reorderLevel;
                                            return (
                                                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-amber-50' : ''}`}>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        {item.itemName}
                                                        {isLow && <AlertCircle size={14} className="text-amber-500" title="Low Stock" />}
                                                    </td>
                                                    <td className={`px-6 py-4 text-sm font-bold ${isLow ? 'text-amber-600' : 'text-gray-700'}`}>
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.supplier || '-'}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">฿{parseFloat(item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => setInventoryModal({ open: true, data: item })} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={16} /></button>
                                                            <button onClick={() => handleDeleteInventory(item.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <ExpenseFormModal
                isOpen={expenseModal.open}
                onClose={() => setExpenseModal({ open: false, data: null })}
                onSubmit={handleSaveExpense}
                initialData={expenseModal.data}
                isLoading={isSaving}
            />

            <InventoryFormModal
                isOpen={inventoryModal.open}
                onClose={() => setInventoryModal({ open: false, data: null })}
                onSubmit={handleSaveInventory}
                initialData={inventoryModal.data}
                isLoading={isSaving}
            />
        </DashboardLayout>
    );
};

export default ExpensesPage;
