import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, DollarSign } from 'lucide-react';

const CATEGORIES = [
    'Salaries',
    'Supplies',
    'Utilities',
    'Rent',
    'Equipment',
    'Marketing',
    'Other'
];

const ExpenseFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const isEditMode = !!initialData?.id;

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            expenseDate: new Date().toISOString().split('T')[0],
            category: 'Supplies',
            description: '',
            amount: '',
            vendor: '',
            receiptUrl: ''
        }
    });

    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                expenseDate: initialData.expenseDate || new Date().toISOString().split('T')[0],
                category: initialData.category || 'Supplies',
                description: initialData.description || '',
                amount: initialData.amount || '',
                vendor: initialData.vendor || '',
                receiptUrl: initialData.receiptUrl || ''
            });
        } else if (isOpen) {
            reset({
                expenseDate: new Date().toISOString().split('T')[0],
                category: 'Supplies',
                description: '',
                amount: '',
                vendor: '',
                receiptUrl: ''
            });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-50 p-2 rounded-lg">
                            <DollarSign className="text-teal-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-primary-900">
                            {isEditMode ? 'Edit Expense' : 'Add Expense'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                        <input
                            type="date"
                            {...register('expenseDate', { required: 'Date is required' })}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.expenseDate ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.expenseDate && <span className="text-red-500 text-xs mt-1">{errors.expenseDate.message}</span>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                        <select
                            {...register('category', { required: 'Category is required' })}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none bg-white ${errors.category ? 'border-red-500' : 'border-gray-200'}`}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <span className="text-red-500 text-xs mt-1">{errors.category.message}</span>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            rows="3"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="Enter expense details"
                        />
                        {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                            <input
                                type="number"
                                step="0.01"
                                {...register('amount', {
                                    required: 'Amount is required',
                                    min: { value: 0, message: 'Amount must be positive' }
                                })}
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.amount ? 'border-red-500' : 'border-gray-200'}`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && <span className="text-red-500 text-xs mt-1">{errors.amount.message}</span>}
                    </div>

                    {/* Vendor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor / Payee</label>
                        <input
                            type="text"
                            {...register('vendor')}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                            placeholder="e.g. Electric Company, Office Depot"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isEditMode ? 'Save Changes' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseFormModal;
