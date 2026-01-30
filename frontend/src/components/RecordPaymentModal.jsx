import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { recordPayment } from '../services/api';

const RecordPaymentModal = ({ isOpen, onClose, invoice, onSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            amountPaid: invoice?.totalAmount || 0
        }
    });

    useEffect(() => {
        if (isOpen && invoice) {
            reset({
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'cash',
                amountPaid: parseFloat(invoice.totalAmount || 0)
            });
        }
    }, [isOpen, invoice, reset]);

    if (!isOpen || !invoice) return null;

    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            await recordPayment(invoice.id, data);
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.message || 'Failed to record payment');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-primary-900">Record Payment</h2>
                        <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Invoice Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Patient</span>
                            <span className="font-medium text-gray-900">{invoice.patient?.firstName} {invoice.patient?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-bold text-lg text-teal-600">฿{parseFloat(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Payment Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Date</label>
                        <input
                            type="date"
                            {...register('paymentDate', { required: 'Date is required' })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                        />
                        {errors.paymentDate && <span className="text-red-500 text-xs">{errors.paymentDate.message}</span>}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                        <select
                            {...register('paymentMethod', { required: 'Method is required' })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                        >
                            <option value="cash">Cash</option>
                            <option value="credit">Credit Card</option>
                            <option value="transfer">Bank Transfer</option>
                            <option value="promptpay">PromptPay</option>
                        </select>
                    </div>

                    {/* Amount Paid */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Paid (฿)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('amountPaid', { required: 'Amount is required', min: 0 })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none font-mono"
                        />
                        {errors.amountPaid && <span className="text-red-500 text-xs">{errors.amountPaid.message}</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                            Record Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordPaymentModal;
