import React, { useState, useEffect } from 'react';
import {
    X, User, Phone, Mail, MapPin, Calendar, Heart, AlertCircle, Pill,
    FileText, DollarSign, Clock, ChevronRight, Loader2
} from 'lucide-react';
import { getTreatments, getInvoices } from '../services/api';

const ViewPatientModal = ({ isOpen, onClose, patient }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [treatments, setTreatments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && patient) {
            setActiveTab('info');
            // Optimistically fetch data for tabs
            fetchData();
        }
    }, [isOpen, patient]);

    const fetchData = async () => {
        if (!patient) return;
        setLoading(true);
        try {
            const [treatmentsRes, invoicesRes] = await Promise.all([
                getTreatments({ patientHN: patient.hn }),
                getInvoices({ search: patient.hn }) // Assuming search covers HN
            ]);
            setTreatments(treatmentsRes || []);
            setInvoices(invoicesRes || []);
        } catch (error) {
            console.error("Failed to fetch patient history", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !patient) return null;

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                    ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-white flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-50 p-3 rounded-full hidden sm:block">
                                <User className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {patient.title} {patient.firstName} {patient.lastName}
                                    </h2>
                                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {patient.hn}
                                    </span>
                                </div>
                                <p className="text-gray-500 mt-1 text-sm flex items-center gap-2">
                                    {patient.gender} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex mt-6 border-b border-gray-200">
                        <TabButton id="info" label="Overview" icon={User} />
                        <TabButton id="treatments" label="Treatments" icon={FileText} />
                        <TabButton id="billing" label="Billing" icon={DollarSign} />
                    </div>
                </div>

                <div className="overflow-y-auto p-6 bg-gray-50 flex-grow">
                    {/* INFO TAB */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Contact & Personal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Phone</p>
                                                <p className="text-sm text-gray-600">{patient.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Email</p>
                                                <p className="text-sm text-gray-600">{patient.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Address</p>
                                                <p className="text-sm text-gray-600 whitespace-pre-line">{patient.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Personal Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                                                <p className="text-sm text-gray-600">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Emergency Contact</p>
                                                <p className="text-sm text-gray-600">
                                                    {patient.emergencyContactName || 'N/A'}
                                                    {patient.emergencyContactPhone && <span className="text-gray-400 mx-1">•</span>}
                                                    {patient.emergencyContactPhone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Profile */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Medical Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <div className="flex items-center gap-2 mb-2 text-red-800 font-semibold text-sm">
                                            <AlertCircle className="w-4 h-4" /> Allergies
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {patient.allergies || 'No known allergies'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold text-sm">
                                            <Heart className="w-4 h-4" /> Medical History
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {patient.medicalHistory || 'No significant history'}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-2 mb-2 text-green-800 font-semibold text-sm">
                                            <Pill className="w-4 h-4" /> Current Medications
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {patient.currentMedications || 'No current medications'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TREATMENTS TAB */}
                    {activeTab === 'treatments' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : treatments.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">
                                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    No treatments recorded.
                                </div>
                            ) : (
                                treatments.map(t => (
                                    <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {t.status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(t.treatmentDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {t.procedureCodes?.join(', ') || 'General Treatment'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Dentist: Dr. {t.dentist?.lastName || 'Unknown'} • Feet: {t.toothNumbers?.join(', ') || '-'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">฿{parseFloat(t.estimatedCost).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Estimated Cost</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === 'billing' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : invoices.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">
                                    <DollarSign className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    No invoices found.
                                </div>
                            ) : (
                                invoices.map(inv => (
                                    <div key={inv.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <DollarSign className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Invoice #{inv.invoiceNumber}</p>
                                                <p className="text-sm text-gray-500">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">฿{parseFloat(inv.totalAmount).toLocaleString()}</p>
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${inv.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {inv.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>

                <div className="p-4 border-t border-gray-200 bg-white flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPatientModal;
