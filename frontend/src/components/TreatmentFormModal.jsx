import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, FileText, Check, AlertCircle } from 'lucide-react';
import { PROCEDURE_CODES } from '../config/procedureCodes';

const TOOTH_NUMBERS = Array.from({ length: 32 }, (_, i) => i + 1);

const TreatmentFormModal = ({ isOpen, onClose, onSubmit, initialData, patient, isLoading, isViewMode = false }) => {
    const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = useForm({
        defaultValues: {
            treatmentDate: new Date().toISOString().split('T')[0],
            procedureCodes: [],
            toothNumbers: [],
            description: '',
            clinicalNotes: '',
            estimatedCost: 0,
            status: 'planned'
        }
    });

    const [selectedProcedures, setSelectedProcedures] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    treatmentDate: initialData.treatmentDate,
                    procedureCodes: initialData.procedureCodes || [],
                    toothNumbers: initialData.toothNumbers || [],
                    description: initialData.description,
                    clinicalNotes: initialData.clinicalNotes,
                    estimatedCost: initialData.estimatedCost,
                    status: initialData.status
                });
                // Calculate initial procedures for display/cost calc if needed
            } else {
                reset({
                    treatmentDate: new Date().toISOString().split('T')[0],
                    procedureCodes: [],
                    toothNumbers: [],
                    description: '',
                    clinicalNotes: '',
                    estimatedCost: 0,
                    status: 'planned'
                });
            }
        }
    }, [isOpen, initialData, reset]);

    // Auto-calculate cost based on selected procedures
    const watchedProcedures = watch('procedureCodes');

    useEffect(() => {
        if (watchedProcedures && !initialData) { // Only auto-calc on new entires or explicitly if needed
            const totalCost = watchedProcedures.reduce((sum, code) => {
                const proc = PROCEDURE_CODES.find(p => p.code === code);
                return sum + (proc ? proc.price : 0);
            }, 0);
            setValue('estimatedCost', totalCost);
        }
    }, [watchedProcedures, setValue, initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-900">
                            {isViewMode ? 'Treatment Details' : initialData ? 'Edit Treatment' : 'New Treatment Record'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Patient: <span className="font-semibold text-primary-700">{patient?.firstName} {patient?.lastName}</span> ({patient?.hn})
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <form id="treatment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Row 1: Date and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Date</label>
                                <input
                                    type="date"
                                    disabled={isViewMode}
                                    {...register('treatmentDate', { required: 'Date is required' })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none disabled:bg-gray-100"
                                />
                                {errors.treatmentDate && <span className="text-red-500 text-xs mt-1">{errors.treatmentDate.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    disabled={isViewMode}
                                    {...register('status', { required: 'Status is required' })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none disabled:bg-gray-100"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Tooth Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tooth Numbers involved</label>
                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <Controller
                                    name="toothNumbers"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-wrap gap-2">
                                            {TOOTH_NUMBERS.map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    disabled={isViewMode}
                                                    onClick={() => {
                                                        const current = field.value || [];
                                                        const updated = current.includes(num)
                                                            ? current.filter(n => n !== num)
                                                            : [...current, num];
                                                        field.onChange(updated);
                                                    }}
                                                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${(field.value || []).includes(num)
                                                            ? 'bg-teal-600 text-white shadow-md'
                                                            : 'bg-white text-gray-600 border border-gray-300 hover:border-teal-400'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-2">Select all teeth that apply to this treatment.</p>
                            </div>
                        </div>

                        {/* Row 3: Procedures */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Procedures</label>
                            <Controller
                                name="procedureCodes"
                                control={control}
                                rules={{ required: 'At least one procedure is required' }}
                                render={({ field }) => (
                                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                        {PROCEDURE_CODES.map(proc => (
                                            <label key={proc.code} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    disabled={isViewMode}
                                                    checked={(field.value || []).includes(proc.code)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        const current = field.value || [];
                                                        const updated = checked
                                                            ? [...current, proc.code]
                                                            : current.filter(c => c !== proc.code);
                                                        field.onChange(updated);
                                                    }}
                                                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                                />
                                                <div className="flex-grow flex justify-between">
                                                    <span className="text-gray-900 font-medium">{proc.code} - {proc.label}</span>
                                                    <span className="text-gray-500">฿{proc.price.toLocaleString()}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                            {errors.procedureCodes && <span className="text-red-500 text-xs mt-1">{errors.procedureCodes.message}</span>}
                        </div>

                        {/* Row 4: Description & Notes */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    disabled={isViewMode}
                                    {...register('description')}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none disabled:bg-gray-100"
                                    placeholder="Brief description of the treatment..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Notes</label>
                                <textarea
                                    disabled={isViewMode}
                                    {...register('clinicalNotes')}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none disabled:bg-gray-100"
                                    placeholder="Detailed clinical findings, materials used, etc..."
                                />
                            </div>
                        </div>

                        {/* Row 5: Cost */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Cost (฿)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                                <input
                                    type="number"
                                    disabled={isViewMode}
                                    {...register('estimatedCost', { min: 0, required: 'Cost is required' })}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none disabled:bg-gray-100 font-mono"
                                />
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors"
                    >
                        {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                        <button
                            type="submit"
                            form="treatment-form"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 shadow-md flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : <><Save size={20} /> Save Record</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreatmentFormModal;
