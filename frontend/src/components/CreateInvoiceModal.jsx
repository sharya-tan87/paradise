import React, { useEffect, useState, useMemo } from 'react';
import {
    X, Search, FileText, DollarSign, Loader2, Check,
    User, ChevronRight, Receipt, Clock, ArrowLeft,
    CheckCircle2, Circle, Minus, Plus, Percent, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { searchPatients, getTreatments, createInvoice } from '../services/api';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess, initialPatient }) => {
    const { t } = useTranslation();

    // Steps: 1 = Select Patient, 2 = Select Treatments, 3 = Review & Create
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [treatments, setTreatments] = useState([]);
    const [isLoadingTreatments, setIsLoadingTreatments] = useState(false);
    const [selectedTreatments, setSelectedTreatments] = useState([]);

    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percent'
    const [vatIncluded, setVatIncluded] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load recent patients from localStorage
    useEffect(() => {
        const storedRecent = localStorage.getItem('recentInvoicePatients');
        if (storedRecent) {
            try {
                setRecentPatients(JSON.parse(storedRecent));
            } catch (e) {
                console.error('Failed to parse recent patients', e);
            }
        }
    }, []);

    // Save recent patient to localStorage
    const saveRecentPatient = (patient) => {
        const updated = [patient, ...recentPatients.filter(p => p.hn !== patient.hn)].slice(0, 5);
        setRecentPatients(updated);
        localStorage.setItem('recentInvoicePatients', JSON.stringify(updated));
    };

    // Reset modal state on open
    useEffect(() => {
        if (isOpen) {
            setSaveSuccess(false);
            if (initialPatient) {
                handleSelectPatient(initialPatient);
            } else {
                setStep(1);
                setSearchTerm('');
                setPatients([]);
                setSelectedPatient(null);
                setTreatments([]);
                setSelectedTreatments([]);
            }
            setDiscount(0);
            setDiscountType('amount');
            setVatIncluded(true);
        }
    }, [isOpen, initialPatient]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        try {
            const res = await searchPatients({ search: searchTerm, limit: 10 });
            setPatients(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectPatient = async (patient) => {
        setSelectedPatient(patient);
        saveRecentPatient(patient);
        setPatients([]);
        setStep(2);
        setIsLoadingTreatments(true);
        try {
            const res = await getTreatments({ patientHN: patient.hn, excludeInvoiced: 'true' });
            setTreatments(res || []);
            // Auto-select all treatments
            setSelectedTreatments((res || []).map(t => t.id));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingTreatments(false);
        }
    };

    const toggleTreatment = (treatmentId) => {
        setSelectedTreatments(prev =>
            prev.includes(treatmentId)
                ? prev.filter(id => id !== treatmentId)
                : [...prev, treatmentId]
        );
    };

    const selectAll = () => {
        setSelectedTreatments(treatments.map(t => t.id));
    };

    const deselectAll = () => {
        setSelectedTreatments([]);
    };

    // Calculate Totals
    const selectedItems = useMemo(() =>
        treatments.filter(t => selectedTreatments.includes(t.id)),
        [treatments, selectedTreatments]
    );

    const subtotal = useMemo(() =>
        selectedItems.reduce((sum, t) => sum + parseFloat(t.estimatedCost || 0), 0),
        [selectedItems]
    );

    const discountAmount = useMemo(() => {
        if (discountType === 'percent') {
            return subtotal * (parseFloat(discount || 0) / 100);
        }
        return parseFloat(discount || 0);
    }, [subtotal, discount, discountType]);

    const afterDiscount = useMemo(() =>
        Math.max(0, subtotal - discountAmount),
        [subtotal, discountAmount]
    );

    const taxAmount = useMemo(() =>
        vatIncluded ? afterDiscount * 0.07 : 0,
        [afterDiscount, vatIncluded]
    );

    const totalAmount = useMemo(() =>
        afterDiscount + taxAmount,
        [afterDiscount, taxAmount]
    );

    const handleSubmit = async () => {
        if (selectedTreatments.length === 0) {
            alert(t('createModal.errorSelect'));
            return;
        }

        setIsSaving(true);
        try {
            await createInvoice({
                patientHN: selectedPatient.hn,
                treatmentIds: selectedTreatments,
                discount: discountAmount,
                vatIncluded
            });
            setSaveSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (error) {
            alert(error.error || error.message || 'Failed to create invoice');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    // Step indicator component
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-1 mb-6">
            {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${step >= s
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                        : 'bg-gray-100 text-gray-400'
                        }`}>
                        {step > s ? <Check size={18} /> : s}
                    </div>
                    {s < 3 && (
                        <div className={`w-12 h-1 rounded-full transition-all ${step > s ? 'bg-teal-600' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // Step titles
    const stepTitles = {
        1: t('createModal.step1Title') || 'เลือกคนไข้',
        2: t('createModal.step2Title') || 'เลือกรายการรักษา',
        3: t('createModal.step3Title') || 'ตรวจสอบและสร้างใบแจ้งหนี้'
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Receipt size={24} />
                                {t('createModal.title')}
                            </h2>
                            <p className="text-teal-100 text-sm mt-1">{stepTitles[step]}</p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="px-6 pt-6 flex-shrink-0">
                    <StepIndicator />
                </div>

                {/* Content */}
                <div className="px-6 pb-6 overflow-y-auto flex-grow">
                    {/* STEP 1: Select Patient */}
                    {step === 1 && (
                        <div className="space-y-5">
                            {/* Search Box */}
                            <div className="relative">
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder={t('createModal.searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none text-lg transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="px-6 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-70 transition-all shadow-lg shadow-teal-200 flex items-center gap-2"
                                    >
                                        {isSearching ? <Loader2 className="animate-spin" size={20} /> : t('createModal.searchBtn') || 'ค้นหา'}
                                    </button>
                                </div>
                            </div>

                            {/* Search Results */}
                            {patients.length > 0 && (
                                <div className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-lg">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-600">{t('createModal.searchResults') || 'ผลการค้นหา'}</p>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {patients.map(p => (
                                            <button
                                                key={p.hn}
                                                onClick={() => handleSelectPatient(p)}
                                                className="w-full p-4 border-b border-gray-50 last:border-b-0 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-teal-100 p-2 rounded-full">
                                                        <User className="text-teal-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{p.firstName} {p.lastName}</p>
                                                        <p className="text-sm text-gray-500">HN: {p.hn} • {p.phone}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="text-gray-400" size={20} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Patients */}
                            {patients.length === 0 && recentPatients.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock size={16} />
                                        <span className="text-sm font-medium">{t('createModal.recentPatients') || 'คนไข้ล่าสุด'}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {recentPatients.map(p => (
                                            <button
                                                key={p.hn}
                                                onClick={() => handleSelectPatient(p)}
                                                className="p-4 border-2 border-gray-100 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all flex items-center gap-3 text-left group"
                                            >
                                                <div className="bg-gray-100 group-hover:bg-teal-100 p-2.5 rounded-full transition-colors">
                                                    <User className="text-gray-500 group-hover:text-teal-600 transition-colors" size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{p.firstName} {p.lastName}</p>
                                                    <p className="text-xs text-gray-500 font-mono">HN: {p.hn}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {patients.length === 0 && recentPatients.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">{t('createModal.searchHint') || 'ค้นหาคนไข้ด้วยชื่อหรือ HN'}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Select Treatments */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {/* Selected Patient Card */}
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-500 p-2.5 rounded-full">
                                        <User className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                                        <p className="text-sm text-gray-500 font-mono">HN: {selectedPatient?.hn}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setSelectedPatient(null);
                                        setTreatments([]);
                                        setSelectedTreatments([]);
                                    }}
                                    className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    {t('createModal.changePatient')}
                                </button>
                            </div>

                            {/* Treatments List */}
                            {isLoadingTreatments ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-teal-500 mb-3" size={40} />
                                    <p className="text-gray-500">{t('createModal.loadingTreatments') || 'กำลังโหลดรายการรักษา...'}</p>
                                </div>
                            ) : treatments.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <FileText className="h-14 w-14 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium text-gray-600">{t('createModal.noTreatments')}</p>
                                    <p className="text-sm text-gray-400 mt-1">{t('createModal.noTreatmentsDesc') || 'คนไข้นี้ไม่มีรายการรักษาที่ยังไม่ได้ออกใบแจ้งหนี้'}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                            <FileText size={18} className="text-teal-600" />
                                            {t('createModal.selectTreatments')}
                                            <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold">{selectedTreatments.length}/{treatments.length}</span>
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <button onClick={selectAll} className="text-sm text-teal-600 hover:text-teal-800 font-medium px-2 py-1 hover:bg-teal-50 rounded transition-colors">{t('createModal.selectAll')}</button>
                                            <span className="text-gray-200">|</span>
                                            <button onClick={deselectAll} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-2 py-1 hover:bg-gray-50 rounded transition-colors">{t('createModal.deselectAll')}</button>
                                        </div>
                                    </div>

                                    <div className="border-2 border-gray-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                                        {treatments.map(t => {
                                            const isSelected = selectedTreatments.includes(t.id);
                                            return (
                                                <label
                                                    key={t.id}
                                                    className={`flex items-center justify-between p-4 border-b border-gray-50 last:border-b-0 cursor-pointer transition-all ${isSelected
                                                        ? 'bg-teal-50 hover:bg-teal-100'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                                                            ? 'bg-teal-600 border-teal-600'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {isSelected && <Check className="text-white" size={14} />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleTreatment(t.id)}
                                                            className="hidden"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{t.description || (t.procedureCodes && t.procedureCodes.join(', ')) || 'Treatment'}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {new Date(t.treatmentDate).toLocaleDateString('th-TH')}
                                                                </span>
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {t.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`font-mono font-bold text-lg ${isSelected ? 'text-teal-700' : 'text-gray-500'}`}>
                                                        ฿{parseFloat(t.estimatedCost || 0).toLocaleString()}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* Calculation Panel */}
                            {treatments.length > 0 && (
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200 space-y-4">
                                    {/* Subtotal */}
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span className="font-medium">{t('createModal.subtotal')}</span>
                                        <span className="font-mono text-lg font-bold text-gray-900">฿{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    {/* Discount */}
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-gray-600 font-medium flex-shrink-0">{t('createModal.discount')}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setDiscountType('amount')}
                                                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${discountType === 'amount'
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    ฿
                                                </button>
                                                <button
                                                    onClick={() => setDiscountType('percent')}
                                                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${discountType === 'percent'
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    %
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(e.target.value)}
                                                    className="w-28 px-3 py-2 text-right border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                                                    placeholder="0"
                                                    min="0"
                                                    max={discountType === 'percent' ? "100" : undefined}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* VAT Toggle */}
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={vatIncluded}
                                                    onChange={(e) => setVatIncluded(e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-11 h-6 rounded-full transition-colors ${vatIncluded ? 'bg-teal-600' : 'bg-gray-300'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${vatIncluded ? 'translate-x-5' : ''}`} />
                                                </div>
                                            </div>
                                            <span className="text-gray-600 font-medium">{t('createModal.enableVat')}</span>
                                        </label>
                                        <span className="font-mono text-gray-600">+฿{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
                                        <span className="text-xl font-bold text-gray-900">{t('createModal.total')}</span>
                                        <span className="font-mono text-3xl font-bold text-teal-600">฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Review & Success */}
                    {step === 3 && (
                        <div className="space-y-6">
                            {saveSuccess ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <CheckCircle2 className="text-green-600" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('createModal.successTitle') || 'สร้างใบแจ้งหนี้สำเร็จ!'}</h3>
                                    <p className="text-gray-500">{t('createModal.successDesc') || 'กำลังปิดหน้าต่าง...'}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary Card */}
                                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-2xl text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-white/20 p-2.5 rounded-full">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-teal-100 text-sm">{t('createModal.invoiceFor') || 'ใบแจ้งหนี้สำหรับ'}</p>
                                                <p className="font-bold text-xl">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-4 space-y-2">
                                            <div className="flex justify-between text-teal-100">
                                                <span>{t('createModal.itemCount') || 'จำนวนรายการ'}</span>
                                                <span className="font-bold text-white">{selectedTreatments.length} {t('createModal.items') || 'รายการ'}</span>
                                            </div>
                                            <div className="flex justify-between text-teal-100">
                                                <span>{t('createModal.subtotal')}</span>
                                                <span className="font-mono">฿{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {discountAmount > 0 && (
                                                <div className="flex justify-between text-teal-100">
                                                    <span>{t('createModal.discount')}</span>
                                                    <span className="font-mono">-฿{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            {vatIncluded && (
                                                <div className="flex justify-between text-teal-100">
                                                    <span>{t('createModal.vat')}</span>
                                                    <span className="font-mono">+฿{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-white pt-3 border-t border-white/20">
                                                <span className="font-bold text-lg">{t('createModal.total')}</span>
                                                <span className="font-mono font-bold text-2xl">฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3">{t('createModal.itemsIncluded') || 'รายการที่รวมอยู่ในใบแจ้งหนี้'}</h4>
                                        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                                            {selectedItems.map((item, idx) => (
                                                <div key={item.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-b-0 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400">{idx + 1}.</span>
                                                        <span className="text-gray-700">{item.description || (item.procedureCodes && item.procedureCodes.join(', ')) || 'Treatment'}</span>
                                                    </div>
                                                    <span className="font-mono text-gray-600">฿{parseFloat(item.estimatedCost || 0).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0 bg-gray-50 rounded-b-2xl">
                    {step > 1 && !saveSuccess ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <ArrowLeft size={18} />
                            {t('createModal.back') || 'ย้อนกลับ'}
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-3">
                        {!saveSuccess && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-white transition-colors"
                            >
                                {t('createModal.cancel')}
                            </button>
                        )}

                        {step === 2 && treatments.length > 0 && selectedTreatments.length > 0 && (
                            <button
                                onClick={() => setStep(3)}
                                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center gap-2 transition-all"
                            >
                                {t('createModal.reviewBtn') || 'ตรวจสอบ'}
                                <ChevronRight size={18} />
                            </button>
                        )}

                        {step === 3 && !saveSuccess && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold hover:from-teal-700 hover:to-emerald-700 shadow-xl shadow-teal-200 flex items-center gap-2 transition-all disabled:opacity-70 text-lg"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={22} />
                                        {t('createModal.creating') || 'กำลังสร้าง...'}
                                    </>
                                ) : (
                                    <>
                                        <Receipt size={22} />
                                        {t('createModal.create')}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
