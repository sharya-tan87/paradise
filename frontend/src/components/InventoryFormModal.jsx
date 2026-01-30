import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Package } from 'lucide-react';

const InventoryFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const isEditMode = !!initialData?.id;

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            itemName: '',
            quantity: 0,
            reorderLevel: 10,
            unitCost: '',
            supplier: ''
        }
    });

    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                itemName: initialData.itemName || '',
                quantity: initialData.quantity || 0,
                reorderLevel: initialData.reorderLevel || 10,
                unitCost: initialData.unitCost || '',
                supplier: initialData.supplier || ''
            });
        } else if (isOpen) {
            reset({
                itemName: '',
                quantity: 0,
                reorderLevel: 10,
                unitCost: '',
                supplier: ''
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
                            <Package className="text-teal-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-primary-900">
                            {isEditMode ? 'Edit Item' : 'Add Inventory Item'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Item Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                        <input
                            type="text"
                            {...register('itemName', { required: 'Item Name is required' })}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.itemName ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="e.g. Latex Gloves (M)"
                        />
                        {errors.itemName && <span className="text-red-500 text-xs mt-1">{errors.itemName.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                            <input
                                type="number"
                                {...register('quantity', {
                                    required: 'Quantity is required',
                                    min: { value: 0, message: 'Cannot be negative' }
                                })}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.quantity ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.quantity && <span className="text-red-500 text-xs mt-1">{errors.quantity.message}</span>}
                        </div>

                        {/* Reorder Level */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reorder Level *</label>
                            <input
                                type="number"
                                {...register('reorderLevel', {
                                    required: 'Reorder Level is required',
                                    min: { value: 0, message: 'Cannot be negative' }
                                })}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.reorderLevel ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.reorderLevel && <span className="text-red-500 text-xs mt-1">{errors.reorderLevel.message}</span>}
                        </div>
                    </div>

                    {/* Unit Cost */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Cost *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                            <input
                                type="number"
                                step="0.01"
                                {...register('unitCost', {
                                    required: 'Unit Cost is required',
                                    min: { value: 0, message: 'Cannot be negative' }
                                })}
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none ${errors.unitCost ? 'border-red-500' : 'border-gray-200'}`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.unitCost && <span className="text-red-500 text-xs mt-1">{errors.unitCost.message}</span>}
                    </div>

                    {/* Supplier */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                        <input
                            type="text"
                            {...register('supplier')}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                            placeholder="Supplier Name"
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
                            {isEditMode ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryFormModal;
