import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Calendar, Clock, Stethoscope, FileText, Search, UserPlus, Users, ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitAppointmentRequest, searchPatients, createPatient } from '../services/api';

const CreateRequestModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();

    // Step: 'select' | 'existing' | 'new' | 'appointment'
    const [step, setStep] = useState('select');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Selected/Created Patient
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Search States (for existing patient)
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // New Patient Form
    const [newPatientData, setNewPatientData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        gender: 'male'
    });

    // Appointment Form
    const [appointmentData, setAppointmentData] = useState({
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        serviceType: 'General Checkup',
        notes: ''
    });

    // Reset modal state when closed/opened
    useEffect(() => {
        if (isOpen) {
            setStep('select');
            setSelectedPatient(null);
            setSearchTerm('');
            setSearchResults([]);
            setError(null);
            setNewPatientData({
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                dateOfBirth: '',
                gender: 'male'
            });
            setAppointmentData({
                preferredDate: new Date().toISOString().split('T')[0],
                preferredTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                serviceType: 'General Checkup',
                notes: ''
            });
        }
    }, [isOpen]);

    // Debounce search for existing patients
    useEffect(() => {
        if (step !== 'existing') return;

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
    }, [searchTerm, step]);

    if (!isOpen) return null;

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setStep('appointment');
    };

    const handleNewPatientChange = (e) => {
        const { name, value } = e.target;
        setNewPatientData(prev => ({ ...prev, [name]: value }));
    };

    const handleAppointmentChange = (e) => {
        const { name, value } = e.target;
        setAppointmentData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateNewPatient = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await createPatient(newPatientData);
            setSelectedPatient(response.data || response);
            setStep('appointment');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAppointment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const fullName = selectedPatient.firstName
                ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                : selectedPatient.name;

            const requestData = {
                name: fullName,
                phone: selectedPatient.phone || '',
                email: selectedPatient.email || '',
                preferredDate: appointmentData.preferredDate,
                preferredTime: appointmentData.preferredTime,
                serviceType: appointmentData.serviceType,
                notes: appointmentData.notes
            };

            await submitAppointmentRequest(requestData);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => {
        const steps = [
            { key: 'select', label: 'เลือกประเภท' },
            { key: 'patient', label: 'ข้อมูลคนไข้' },
            { key: 'appointment', label: 'นัดหมาย' }
        ];

        const currentIndex = step === 'select' ? 0 : (step === 'appointment' ? 2 : 1);

        return (
            <div className="flex items-center justify-center gap-2 mb-6">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.key}>
                        <div className={`flex items-center gap-1 ${idx <= currentIndex ? 'text-primary-600' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < currentIndex ? 'bg-primary-500 text-white' : idx === currentIndex ? 'bg-primary-100 text-primary-600 border-2 border-primary-500' : 'bg-gray-100 text-gray-400'}`}>
                                {idx < currentIndex ? <Check size={14} /> : idx + 1}
                            </div>
                            <span className="text-xs hidden sm:inline">{s.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`w-8 h-0.5 ${idx < currentIndex ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Step 1: Select Patient Type
    const renderSelectStep = () => (
        <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">เลือกประเภทคนไข้เพื่อสร้างนัดหมายใหม่</p>

            <button
                type="button"
                onClick={() => setStep('existing')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
                <div className="bg-teal-100 p-3 rounded-full text-teal-600 group-hover:bg-teal-200">
                    <Users size={24} />
                </div>
                <div className="text-left">
                    <h4 className="font-semibold text-gray-900">คนไข้เก่า (Existing Patient)</h4>
                    <p className="text-sm text-gray-500">ค้นหาจากระเบียนคนไข้ที่มีอยู่แล้ว</p>
                </div>
            </button>

            <button
                type="button"
                onClick={() => setStep('new')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-200">
                    <UserPlus size={24} />
                </div>
                <div className="text-left">
                    <h4 className="font-semibold text-gray-900">คนไข้ใหม่ (New Patient)</h4>
                    <p className="text-sm text-gray-500">สร้างข้อมูลคนไข้ใหม่ก่อนนัดหมาย</p>
                </div>
            </button>
        </div>
    );

    // Step 2a: Search Existing Patient
    const renderExistingStep = () => (
        <div className="space-y-4">
            <button
                type="button"
                onClick={() => setStep('select')}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-2"
            >
                <ChevronLeft size={16} />
                <span>กลับ</span>
            </button>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            <div className="border rounded-lg max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                    searchResults.map((patient) => (
                        <div
                            key={patient.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handlePatientSelect(patient)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <User size={18} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {patient.firstName} {patient.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {patient.hn} • {patient.phone}
                                    </p>
                                </div>
                            </div>
                            <span className="text-primary-600 text-sm font-medium">เลือก</span>
                        </div>
                    ))
                ) : searchTerm.length >= 2 && !isSearching ? (
                    <div className="p-6 text-center text-gray-500">
                        <p className="mb-2">ไม่พบคนไข้ในระบบ</p>
                        <button
                            type="button"
                            onClick={() => setStep('new')}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                            สร้างคนไข้ใหม่แทน →
                        </button>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-400">
                        <Search size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Step 2b: Create New Patient
    const renderNewPatientStep = () => (
        <form onSubmit={handleCreateNewPatient} className="space-y-4">
            <button
                type="button"
                onClick={() => setStep('select')}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-2"
            >
                <ChevronLeft size={16} />
                <span>กลับ</span>
            </button>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                    <strong>สร้างคนไข้ใหม่:</strong> กรอกข้อมูลคนไข้ แล้วระบบจะสร้างประวัติและนำไปนัดหมายต่อ
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        required
                        value={newPatientData.firstName}
                        onChange={handleNewPatientChange}
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                        placeholder="ชื่อจริง"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        required
                        value={newPatientData.lastName}
                        onChange={handleNewPatientChange}
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                        placeholder="นามสกุล"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        เบอร์โทร <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={newPatientData.phone}
                            onChange={handleNewPatientChange}
                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border"
                            placeholder="0812345678"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={newPatientData.email}
                            onChange={handleNewPatientChange}
                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={newPatientData.dateOfBirth}
                        onChange={handleNewPatientChange}
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เพศ</label>
                    <select
                        name="gender"
                        value={newPatientData.gender}
                        onChange={handleNewPatientChange}
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                    >
                        <option value="male">ชาย</option>
                        <option value="female">หญิง</option>
                        <option value="other">อื่นๆ</option>
                    </select>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-sm px-4 py-3 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {loading ? 'กำลังสร้าง...' : (
                        <>
                            <UserPlus size={18} />
                            <span>สร้างคนไข้และดำเนินการต่อ</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );

    // Step 3: Appointment Form
    const renderAppointmentStep = () => (
        <form onSubmit={handleSubmitAppointment} className="space-y-4">
            {/* Selected Patient Info */}
            <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 rounded-full text-teal-600">
                        <User size={18} />
                    </div>
                    <div>
                        <p className="font-medium text-teal-900">
                            {selectedPatient?.firstName} {selectedPatient?.lastName}
                        </p>
                        <p className="text-xs text-teal-600">
                            {selectedPatient?.hn} • {selectedPatient?.phone}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-teal-600">
                    <Check size={16} />
                    <span className="text-xs font-medium">เลือกแล้ว</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันที่ต้องการ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="date"
                            name="preferredDate"
                            required
                            value={appointmentData.preferredDate}
                            onChange={handleAppointmentChange}
                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        เวลา <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="time"
                            name="preferredTime"
                            required
                            value={appointmentData.preferredTime}
                            onChange={handleAppointmentChange}
                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    บริการ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Stethoscope size={16} className="text-gray-400" />
                    </div>
                    <select
                        name="serviceType"
                        required
                        value={appointmentData.serviceType}
                        onChange={handleAppointmentChange}
                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border"
                    >
                        <option value="General Checkup">General Checkup</option>
                        <option value="Teeth Cleaning">Teeth Cleaning</option>
                        <option value="Orthodontics">Orthodontics</option>
                        <option value="Root Canal">Root Canal</option>
                        <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
                        <option value="Tooth Extraction">Tooth Extraction</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea
                    name="notes"
                    rows="3"
                    value={appointmentData.notes}
                    onChange={handleAppointmentChange}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-3 border"
                    placeholder="รายละเอียดเพิ่มเติม..."
                ></textarea>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-sm px-4 py-3 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {loading ? 'กำลังสร้าง...' : (
                        <>
                            <Save size={18} />
                            <span>สร้างนัดหมาย</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-5 pt-5 pb-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="bg-primary-100 p-2 rounded-full text-primary-600">
                                    <FileText size={20} />
                                </span>
                                สร้างนัดหมายใหม่
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {renderStepIndicator()}

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        {step === 'select' && renderSelectStep()}
                        {step === 'existing' && renderExistingStep()}
                        {step === 'new' && renderNewPatientStep()}
                        {step === 'appointment' && renderAppointmentStep()}
                    </div>

                    {step === 'select' && (
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateRequestModal;
