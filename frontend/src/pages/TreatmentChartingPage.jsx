import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search, Plus, Stethoscope, Calendar, DollarSign,
    User, ChevronRight, AlertCircle, FileText, CheckCircle, Clock,
    Users, Activity, Phone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import TreatmentFormModal from '../components/TreatmentFormModal';
import { searchPatients, getTreatments, createTreatment, updateTreatment, getCalendarAppointments, getPatient } from '../services/api';
import { PROCEDURE_CODES } from '../config/procedureCodes';

const TreatmentChartingPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // Get current user safely
    let currentUser = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Failed to parse user', e);
    }

    const isDentist = currentUser?.role === 'dentist';

    // State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [treatments, setTreatments] = useState([]);
    const [isLoadingTreatments, setIsLoadingTreatments] = useState(false);

    // Today's Queue State
    const [todaysQueue, setTodaysQueue] = useState([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // add, edit, view
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Today's Queue for Dentists
    useEffect(() => {
        if ((isDentist || currentUser?.role === 'staff' || currentUser?.role === 'admin') && currentUser?.id) {
            fetchTodaysQueue();
        } else {
            setIsLoadingQueue(false);
        }
    }, [currentUser?.id, currentUser?.role]);

    const fetchTodaysQueue = async () => {
        setIsLoadingQueue(true);
        try {
            const today = new Date();
            const start = new Date(today);
            start.setHours(0, 0, 0, 0);
            const end = new Date(today);
            end.setHours(23, 59, 59, 999);

            const params = {
                start: start.toISOString(),
                end: end.toISOString()
            };

            if (isDentist) {
                params.dentistId = currentUser.id;
            }

            const response = await getCalendarAppointments(params);
            if (response?.success) {
                // Filter confirmed and in-progress, sort by time
                const filtered = (response.data || [])
                    .filter(app => ['confirmed', 'in-progress', 'scheduled'].includes(app.status))
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));
                setTodaysQueue(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch today\'s queue', error);
        } finally {
            setIsLoadingQueue(false);
        }
    };

    // Search Patients
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const term = searchTerm || (location.state && location.state.searchTerm);
        if (!term || !term.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        try {
            const res = await searchPatients({ search: term, limit: 10 });
            setPatients(res.data || []);
            // Auto-select if exact match or only one result
            if (res.data && res.data.length === 1) {
                handleSelectPatient(res.data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-search on mount if state provided
    useEffect(() => {
        if (location.state?.searchTerm) {
            setSearchTerm(location.state.searchTerm);
            // We need to call search logic, but since handleSearch relies on state potentially not updated yet,
            // we'll duplicate the logic slightly or use a specialized effect.
            // Better: just set the term and let a separate effect run or call it directly with the value.
            const performAutoSearch = async () => {
                setIsSearching(true);
                setHasSearched(true);
                try {
                    const res = await searchPatients({ search: location.state.searchTerm, limit: 10 });
                    setPatients(res.data || []);
                    if (res.data && res.data.length === 1) {
                        handleSelectPatient(res.data[0]);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearching(false);
                    // Clear state so it doesn't re-trigger on refresh weirdly (optional)
                    // navigate(location.pathname, { replace: true, state: {} });
                }
            };
            performAutoSearch();
        }
    }, [location.state]);

    // Select Patient & Load Treatments
    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setPatients([]); // Clear search list results to focus on patient
        setSearchTerm('');
        fetchTreatments(patient.hn);
    };

    // Select patient from queue
    const handleSelectFromQueue = async (appointment) => {
        if (appointment.patient?.hn) {
            try {
                // Fetch full patient details including medical history and allergies
                const response = await getPatient(appointment.patient.hn);
                // API returns { success: true, data: patientObject }
                if (response?.success && response?.data) {
                    handleSelectPatient(response.data);
                } else {
                    // Fallback to basic info if fetch structure is unexpected
                    handleSelectPatient(appointment.patient);
                }
            } catch (error) {
                console.error("Failed to fetch full patient details", error);
                // Fallback to basic info from appointment
                handleSelectPatient(appointment.patient);
            }
        }
    };

    const fetchTreatments = async (hn) => {
        setIsLoadingTreatments(true);
        try {
            const res = await getTreatments({ patientHN: hn });
            setTreatments(res || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingTreatments(false);
        }
    };

    // Modal Actions
    const handleOpenAdd = () => {
        setModalMode('add');
        setSelectedTreatment(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (treatment) => {
        setModalMode('edit');
        setSelectedTreatment(treatment);
        setIsModalOpen(true);
    };

    const handleOpenView = (treatment) => {
        setModalMode('view');
        setSelectedTreatment(treatment);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        setIsSaving(true);
        try {
            if (modalMode === 'add') {
                await createTreatment({ ...data, patientHN: selectedPatient.hn });
            } else if (modalMode === 'edit') {
                await updateTreatment(selectedTreatment.id, data);
            }
            await fetchTreatments(selectedPatient.hn);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save treatment:', error);
            const msg = error.message || error.error || 'Failed to save treatment';
            alert(`Error: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Access Control helper
    const canEdit = (treatment) => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin' || currentUser.role === 'staff') return true;
        if (currentUser.role === 'dentist' && treatment.performedBy === currentUser.id) return true;
        return false;
    };

    // Calculations
    const totalCost = treatments.reduce((sum, t) => sum + parseFloat(t.estimatedCost || 0), 0);

    // Format time helper
    const formatTime = (time) => time ? time.substring(0, 5) : '';

    // Get status color for queue items
    const getQueueStatusColor = (status) => {
        const colors = {
            'scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
            'confirmed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'in-progress': 'bg-amber-50 text-amber-700 border-amber-200'
        };
        return colors[status] || colors['scheduled'];
    };

    return (
        <DashboardLayout title={t('treatmentCharting.title')}>
            <div className="flex flex-col h-full">
                <h1 className="text-3xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                    <Stethoscope className="text-teal-600" />
                    {t('treatmentCharting.title')}
                </h1>

                {/* Today's Queue Section - Available for Dentists and Staff */}
                {(isDentist || currentUser?.role === 'staff' || currentUser?.role === 'admin') && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-indigo-900">
                                        {t('treatmentCharting.todaysQueue') || "Today's Queue"}
                                    </h2>
                                    <p className="text-xs text-indigo-600">
                                        {t('treatmentCharting.todaysQueueDesc') || 'Click on a patient to start treatment'}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                {todaysQueue.length} {t('treatmentCharting.patients') || 'patients'}
                            </span>
                        </div>

                        {isLoadingQueue ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : todaysQueue.length === 0 ? (
                            <div className="text-center py-6 text-indigo-600">
                                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">{t('treatmentCharting.noQueueToday') || 'No appointments scheduled for today'}</p>
                            </div>
                        ) : (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {todaysQueue.map((appointment) => {
                                    const patientName = appointment.patient
                                        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                                        : 'Unknown';
                                    const isSelected = selectedPatient?.hn === appointment.patient?.hn;

                                    return (
                                        <button
                                            key={appointment.id}
                                            onClick={() => handleSelectFromQueue(appointment)}
                                            className={`flex-shrink-0 bg-white p-4 rounded-xl border-2 transition-all hover:shadow-md min-w-[200px] text-left ${isSelected
                                                ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200'
                                                : 'border-white hover:border-indigo-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                                    <User className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                        {patientName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-mono">
                                                        HN: {appointment.patient?.hn || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(appointment.startTime)}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getQueueStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            {appointment.serviceType && (
                                                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                                    <Stethoscope className="w-3 h-3" />
                                                    <span className="truncate">{appointment.serviceType}</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Search Section */}
                <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm mb-6">
                    <div className="max-w-xl mx-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">{t('treatmentCharting.selectPatient')}</label>
                        <form onSubmit={handleSearch} className="relative flex gap-2">
                            <input
                                type="text"
                                placeholder={t('treatmentCharting.searchPlaceholder')}
                                className="flex-grow px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none shadow-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-70"
                                disabled={isSearching}
                            >
                                {isSearching ? t('treatmentCharting.searching') : t('treatmentCharting.search')}
                            </button>
                        </form>

                        {/* Search Results Dropdown/Area */}
                        {hasSearched && patients.length > 0 && (
                            <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden shadow-lg bg-white">
                                {patients.map(p => (
                                    <div
                                        key={p.hn}
                                        onClick={() => handleSelectPatient(p)}
                                        className="p-4 border-b border-gray-50 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-primary-900">{p.firstName} {p.lastName}</p>
                                            <p className="text-sm text-gray-500">{p.hn} • {p.phone}</p>
                                        </div>
                                        <ChevronRight className="text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {hasSearched && patients.length === 0 && !isSearching && (
                            <p className="text-center text-gray-500 mt-4">{t('treatmentCharting.noPatientsFound')}</p>
                        )}
                    </div>
                </div>

                {/* Selected Patient Content */}
                {selectedPatient ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Patient & Summary Card */}
                        <div className={`grid grid-cols-1 ${!isDentist ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
                            {/* Patient Info */}
                            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-primary-100 shadow-sm flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="bg-primary-50 p-4 rounded-full h-16 w-16 flex items-center justify-center">
                                        <User className="h-8 w-8 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-primary-900">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-gray-600">
                                            <span className="font-medium bg-gray-100 px-2 rounded">{selectedPatient.hn}</span>
                                            <span>Age: {selectedPatient.dateOfBirth ? (new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()) : 'N/A'}</span>
                                            <span>Gender: {selectedPatient.gender || '-'}</span>
                                            <span>Phone: {selectedPatient.phone}</span>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-500 max-w-lg">
                                            <span className="font-semibold text-gray-700">{t('treatmentCharting.medicalHistory')}:</span> {selectedPatient.medicalHistory || 'None'}
                                            <br />
                                            <span className="font-semibold text-gray-700">{t('treatmentCharting.allergies')}:</span> <span className="text-red-600">{selectedPatient.allergies || 'None'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOpenAdd}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    {t('treatmentCharting.addTreatment')}
                                </button>
                            </div>

                            {/* Cost Summary - Hidden for Dentists */}
                            {!isDentist && (
                                <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
                                    <div className="relative">
                                        <h3 className="text-teal-100 font-medium mb-1">{t('treatmentCharting.totalValue')}</h3>
                                        <p className="text-4xl font-bold">฿{totalCost.toLocaleString()}</p>
                                        <p className="text-sm text-teal-200 mt-2 opacity-80">
                                            {t('treatmentCharting.totalValueDesc')}
                                        </p>
                                        <button
                                            onClick={() => navigate('/dashboard/billing', { state: { patient: selectedPatient, autoOpen: true } })}
                                            className="mt-4 w-full bg-white text-teal-700 py-2.5 rounded-lg font-bold transition-all hover:bg-teal-50 hover:shadow-lg flex items-center justify-center gap-2 shadow-md"
                                        >
                                            <DollarSign size={18} />
                                            {t('treatmentCharting.createInvoice') || 'สร้างใบแจ้งหนี้'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Treatment History List */}
                        <div className="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">{t('treatmentCharting.history')}</h3>
                            </div>

                            {isLoadingTreatments ? (
                                <div className="p-12 text-center text-gray-500">{t('treatmentCharting.loading')}</div>
                            ) : treatments.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>{t('treatmentCharting.noHistory')}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">{t('treatmentCharting.table.date')}</th>
                                                <th className="px-6 py-4 font-semibold">{t('treatmentCharting.table.procedures')}</th>
                                                <th className="px-6 py-4 font-semibold">{t('treatmentCharting.table.teeth')}</th>
                                                <th className="px-6 py-4 font-semibold">{t('treatmentCharting.table.dentist')}</th>
                                                <th className="px-6 py-4 font-semibold">{t('treatmentCharting.table.status')}</th>
                                                {!isDentist && <th className="px-6 py-4 font-semibold text-right">{t('treatmentCharting.table.cost')}</th>}
                                                <th className="px-6 py-4 font-semibold text-right">{t('treatmentCharting.table.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {treatments.map(treatment => (
                                                <tr key={treatment.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                        {new Date(treatment.treatmentDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                                        {treatment.procedureCodes && treatment.procedureCodes.map(code => {
                                                            const p = PROCEDURE_CODES.find(pc => pc.code === code);
                                                            return <span key={code} className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs mr-1 mb-1">{p ? p.label : code}</span>
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {treatment.toothNumbers && treatment.toothNumbers.length > 0 ? treatment.toothNumbers.join(', ') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        Dr. {treatment.dentist ? treatment.dentist.lastName : 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${treatment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            treatment.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {treatment.status}
                                                        </span>
                                                    </td>
                                                    {!isDentist && (
                                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                            ฿{parseFloat(treatment.estimatedCost).toLocaleString()}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleOpenView(treatment)}
                                                            className="text-teal-600 hover:text-teal-800 font-medium text-sm mr-3"
                                                        >
                                                            {t('treatmentCharting.actions.view')}
                                                        </button>
                                                        {canEdit(treatment) && (
                                                            <button
                                                                onClick={() => handleOpenEdit(treatment)}
                                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                            >
                                                                {t('treatmentCharting.actions.edit')}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-primary-200">
                        <User className="h-16 w-16 text-primary-200 mb-4" />
                        <h3 className="text-lg font-medium text-primary-800">{t('treatmentCharting.noPatientSelected')}</h3>
                        <p className="text-gray-500 max-w-sm text-center mt-2">
                            {t('treatmentCharting.noPatientDesc')}
                        </p>
                    </div>
                )}

                <TreatmentFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    initialData={selectedTreatment}
                    patient={selectedPatient}
                    isLoading={isSaving}
                    isViewMode={modalMode === 'view'}
                />
            </div>
        </DashboardLayout>
    );
};

export default TreatmentChartingPage;
