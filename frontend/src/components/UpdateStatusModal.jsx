import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Calendar, Clock, User, Search, UserPlus, Users, Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateAppointmentStatus, getDentists, searchPatients, createPatient } from '../services/api';

const UpdateStatusModal = ({ isOpen, onClose, request, onStatusUpdate }) => {
    const { t } = useTranslation();
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dentists for assignment
    const [dentists, setDentists] = useState([]);
    const [selectedDentist, setSelectedDentist] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Patient Verification - Step in confirm flow
    // 'status' | 'patient-search' | 'patient-create' | 'schedule'
    const [confirmStep, setConfirmStep] = useState('status');

    // Patient Search
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // New Patient Form
    const [newPatientData, setNewPatientData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        gender: 'male'
    });

    // Load dentists on mount
    useEffect(() => {
        const fetchDentists = async () => {
            try {
                const response = await getDentists();
                if (response && response.success) {
                    setDentists(response.data || []);
                }
            } catch (err) {
                console.error('Failed to load dentists', err);
            }
        };
        fetchDentists();
    }, []);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && request) {
            setSelectedStatus(request.status);
            setError(null);
            setConfirmStep('status');
            setSelectedPatient(null);
            setSearchTerm('');
            setSearchResults([]);

            // Pre-fill new patient form from request
            const nameParts = (request.name || '').split(' ');
            setNewPatientData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                phone: request.phone || '',
                email: request.email || '',
                dateOfBirth: '',
                gender: 'male'
            });

            // Parse preferred time
            if (request.preferredTime) {
                const timeStr = request.preferredTime.trim();
                let parsedTime = '09:00';

                if (timeStr.includes('AM') || timeStr.includes('PM')) {
                    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                    if (match) {
                        let hours = parseInt(match[1], 10);
                        const minutes = match[2];
                        const period = match[3].toUpperCase();
                        if (period === 'PM' && hours !== 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                        parsedTime = `${String(hours).padStart(2, '0')}:${minutes}`;
                    }
                } else if (timeStr.includes(':')) {
                    parsedTime = timeStr.substring(0, 5);
                }

                setStartTime(parsedTime);
                const [h, m] = parsedTime.split(':').map(Number);
                const endHour = h + 1;
                setEndTime(`${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            } else {
                setStartTime('09:00');
                setEndTime('10:00');
            }
            setSelectedDentist('');
        }
    }, [isOpen, request]);

    // Debounce search
    useEffect(() => {
        if (confirmStep !== 'patient-search') return;

        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await searchPatients({ search: searchTerm });
                    setSearchResults(results.data || []);
                } catch (err) {
                    console.error('Search failed', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, confirmStep]);

    if (!isOpen || !request) return null;

    const handleStatusSelect = (status) => {
        setSelectedStatus(status);
        setError(null);

        // If selecting 'confirmed' and not already confirmed, go to patient verification
        if (status === 'confirmed' && request.status !== 'confirmed') {
            setConfirmStep('patient-search');
        } else {
            setConfirmStep('status');
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setConfirmStep('schedule');
    };

    const handleCreateNewPatient = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await createPatient(newPatientData);
            const createdPatient = response.data || response;
            setSelectedPatient(createdPatient);
            setConfirmStep('schedule');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create patient');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();

        // For non-confirm statuses, just update status
        if (selectedStatus !== 'confirmed' || request.status === 'confirmed') {
            setIsLoading(true);
            setError(null);
            try {
                await updateAppointmentStatus(request.requestId, selectedStatus);
                onStatusUpdate();
                onClose();
            } catch (err) {
                setError(err.message || 'Failed to update status');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // For confirm - must have patient selected
        if (!selectedPatient) {
            setError('กรุณาเลือกหรือสร้างข้อมูลคนไข้ก่อน');
            setConfirmStep('patient-search');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                status: 'confirmed',
                patientHN: selectedPatient.hn,
                appointmentDetails: {
                    dentistId: selectedDentist || null,
                    startTime: startTime,
                    endTime: endTime
                }
            };

            await updateAppointmentStatus(
                request.requestId,
                'confirmed',
                null, // No auto patient creation
                payload.appointmentDetails,
                selectedPatient.hn // Pass patient HN
            );
            onStatusUpdate();
            onClose();
        } catch (err) {
            console.error('Failed to update status:', err);
            setError(err.message || 'Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    const statusOptions = [
        { value: 'pending', label: t('staffDashboard.updateStatus.status.pending'), color: 'text-amber-600', bg: 'bg-amber-50' },
        { value: 'contacted', label: t('staffDashboard.updateStatus.status.contacted'), color: 'text-blue-600', bg: 'bg-blue-50' },
        { value: 'confirmed', label: t('staffDashboard.updateStatus.status.confirmed'), color: 'text-green-600', bg: 'bg-green-50' },
        { value: 'cancelled', label: t('staffDashboard.updateStatus.status.cancelled'), color: 'text-red-600', bg: 'bg-red-50' },
        { value: 'completed', label: t('staffDashboard.updateStatus.status.completed'), color: 'text-gray-600', bg: 'bg-gray-50' }
    ];

    const isConfirming = selectedStatus === 'confirmed' && request.status !== 'confirmed';

    // Render Step Indicator for confirm flow
    const renderConfirmSteps = () => {
        if (!isConfirming) return null;

        const steps = [
            { key: 'patient-search', label: 'ยืนยันคนไข้' },
            { key: 'schedule', label: 'กำหนดนัดหมาย' }
        ];

        const currentIndex = confirmStep === 'patient-search' || confirmStep === 'patient-create' ? 0 : 1;

        return (
            <div className="flex items-center gap-2 mb-4 px-2">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.key}>
                        <div className={`flex items-center gap-1 ${idx <= currentIndex ? 'text-primary-600' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < currentIndex ? 'bg-primary-500 text-white' : idx === currentIndex ? 'bg-primary-100 text-primary-600 border-2 border-primary-500' : 'bg-gray-100 text-gray-400'}`}>
                                {idx < currentIndex ? <Check size={14} /> : idx + 1}
                            </div>
                            <span className="text-xs">{s.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 ${idx < currentIndex ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Render Patient Search Step
    const renderPatientSearchStep = () => (
        <div className="space-y-4">
            <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                <p className="text-sm text-teal-800">
                    <strong>ขั้นตอนที่ 1:</strong> ค้นหาคนไข้ในระบบ หรือสร้างคนไข้ใหม่
                </p>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="ค้นหาด้วยชื่อ, เบอร์โทร หรือ HN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                    </div>
                )}
            </div>

            <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResults.length > 0 ? (
                    searchResults.map((patient) => (
                        <div
                            key={patient.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handlePatientSelect(patient)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <User size={16} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                        {patient.firstName} {patient.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        HN: {patient.hn} • {patient.phone}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                    ))
                ) : searchTerm.length >= 2 && !isSearching ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        ไม่พบคนไข้ในระบบ
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
                    </div>
                )}
            </div>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">หรือ</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
                type="button"
                onClick={() => setConfirmStep('patient-create')}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-600 hover:text-primary-600"
            >
                <UserPlus size={18} />
                <span className="text-sm font-medium">สร้างคนไข้ใหม่</span>
            </button>
        </div>
    );

    // Render New Patient Form
    const renderPatientCreateStep = () => (
        <div className="space-y-4">
            <button
                type="button"
                onClick={() => setConfirmStep('patient-search')}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
            >
                ← กลับไปค้นหา
            </button>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                    กรอกข้อมูลคนไข้ใหม่ ระบบจะสร้างประวัติและ HN ให้อัตโนมัติ
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ *</label>
                    <input
                        type="text"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                        value={newPatientData.firstName}
                        onChange={e => setNewPatientData({ ...newPatientData, firstName: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">นามสกุล *</label>
                    <input
                        type="text"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                        value={newPatientData.lastName}
                        onChange={e => setNewPatientData({ ...newPatientData, lastName: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทร *</label>
                    <input
                        type="tel"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                        value={newPatientData.phone}
                        onChange={e => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                        value={newPatientData.email}
                        onChange={e => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">วันเกิด</label>
                    <input
                        type="date"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                        value={newPatientData.dateOfBirth}
                        onChange={e => setNewPatientData({ ...newPatientData, dateOfBirth: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">เพศ</label>
                    <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                        value={newPatientData.gender}
                        onChange={e => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                    >
                        <option value="male">ชาย</option>
                        <option value="female">หญิง</option>
                        <option value="other">อื่นๆ</option>
                    </select>
                </div>
            </div>

            <button
                type="button"
                onClick={handleCreateNewPatient}
                disabled={isLoading || !newPatientData.firstName || !newPatientData.lastName || !newPatientData.phone}
                className="w-full flex items-center justify-center gap-2 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'กำลังสร้าง...' : (
                    <>
                        <UserPlus size={18} />
                        <span className="font-medium">สร้างคนไข้และดำเนินการต่อ</span>
                    </>
                )}
            </button>
        </div>
    );

    // Render Schedule Step
    const renderScheduleStep = () => (
        <div className="space-y-4">
            {/* Selected Patient */}
            <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 rounded-full text-teal-600">
                        <User size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-teal-900 text-sm">
                            {selectedPatient?.firstName} {selectedPatient?.lastName}
                        </p>
                        <p className="text-xs text-teal-600">
                            HN: {selectedPatient?.hn} • {selectedPatient?.phone}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-teal-600">
                    <Check size={14} />
                    <span className="text-xs font-medium">ยืนยันแล้ว</span>
                </div>
            </div>

            <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                <p className="text-sm text-teal-800">
                    <strong>ขั้นตอนที่ 2:</strong> กำหนดทันตแพทย์และเวลานัดหมาย
                </p>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <User size={12} />
                        ทันตแพทย์
                    </label>
                    <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                        value={selectedDentist}
                        onChange={e => setSelectedDentist(e.target.value)}
                    >
                        <option value="">-- เลือกทันตแพทย์ --</option>
                        {dentists.map(d => (
                            <option key={d.id} value={d.id}>{d.username}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Clock size={12} />
                            เวลาเริ่ม
                        </label>
                        <input
                            type="time"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                            value={startTime}
                            onChange={e => {
                                setStartTime(e.target.value);
                                const [h, m] = e.target.value.split(':').map(Number);
                                const endHour = h + 1;
                                setEndTime(`${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Clock size={12} />
                            เวลาสิ้นสุด
                        </label>
                        <input
                            type="time"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </div>
                </div>

                <div className="text-xs text-teal-600 bg-teal-100 px-3 py-2 rounded-md flex items-center gap-2">
                    <Calendar size={14} />
                    <span><strong>วันที่นัดหมาย:</strong> {new Date(request.preferredDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
        </div>
    );

    // Render Status Selection (for non-confirm or initial view)
    const renderStatusSelection = () => (
        <div className="space-y-3">
            {statusOptions.map((option) => (
                <label
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedStatus === option.value
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                        : 'border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={selectedStatus === option.value}
                        onChange={() => handleStatusSelect(option.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className={`ml-3 font-medium ${option.color}`}>
                        {option.label}
                    </span>
                    {selectedStatus === option.value && (
                        <CheckCircle className="ml-auto w-5 h-5 text-primary-600" />
                    )}
                </label>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-primary-100 bg-primary-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-primary-900">{t('staffDashboard.updateStatus.title')}</h2>
                        <p className="text-sm text-primary-500">{request.requestId} • {request.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleFinalSubmit} className="flex flex-col flex-1 overflow-y-auto">
                    <div className="p-5 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Show status selection when not in confirm flow or at initial step */}
                        {confirmStep === 'status' && renderStatusSelection()}

                        {/* Show confirm flow steps */}
                        {isConfirming && confirmStep !== 'status' && (
                            <>
                                {renderConfirmSteps()}
                                {confirmStep === 'patient-search' && renderPatientSearchStep()}
                                {confirmStep === 'patient-create' && renderPatientCreateStep()}
                                {confirmStep === 'schedule' && renderScheduleStep()}
                            </>
                        )}
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            {t('staffDashboard.updateStatus.cancel')}
                        </button>

                        {/* Show submit only at appropriate steps */}
                        {(confirmStep === 'status' || confirmStep === 'schedule') && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={isLoading || (isConfirming && confirmStep !== 'schedule')}
                            >
                                {isLoading ? 'กำลังดำเนินการ...' : (
                                    confirmStep === 'schedule' ? 'ยืนยันและสร้างคิว' : t('staffDashboard.updateStatus.confirm')
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateStatusModal;
