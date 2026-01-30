import React from 'react';
import { X, Calendar, Clock, Mail, Phone, FileText, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ViewDetailsModal = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-primary-100 bg-primary-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-primary-900">Request Details</h2>
                        <p className="text-sm text-primary-500 mt-1">ID: {request.requestId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Status Section */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Current Status</span>
                        <StatusBadge status={request.status} />
                    </div>

                    {/* Patient Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                            Patient Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-primary-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{request.name}</p>
                                    <p className="text-xs text-gray-500">Patient Name</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{request.phone}</p>
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{request.email}</p>
                                    <p className="text-xs text-gray-500">Email Address</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                            Appointment Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(request.preferredDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-500">Preferred Date</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-primary-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{request.preferredTime}</p>
                                    <p className="text-xs text-gray-500">Preferred Time</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 pt-2">
                            <FileText className="w-5 h-5 text-primary-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{request.serviceType}</p>
                                <p className="text-xs text-gray-500">Service Type</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                                Additional Notes
                            </h3>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900 text-sm">
                                {request.notes}
                            </div>
                        </div>
                    )}

                    {/* System Info */}
                    <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 flex justify-between">
                        <span>Created: {new Date(request.created_at).toLocaleString()}</span>
                        <span>Updated: {new Date(request.updated_at).toLocaleString()}</span>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewDetailsModal;
