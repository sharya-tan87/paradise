import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, FileText, Receipt } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Task 1 & 2: Get user data from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    if (!user) {
        return null; // Or some loading state, though ProtectedRoute handles access
    }

    return (
        <div className="min-h-screen bg-white font-prompt flex flex-col">
            <Header />

            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Welcome Message */}
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">
                            Welcome, {user.username}!
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage your appointments and personalized care here.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Task 2: Profile Card Component */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-primary-100 rounded-xl shadow-soft p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-primary-50 p-3 rounded-full">
                                        <User className="h-8 w-8 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-primary-900">My Profile</h2>
                                        <p className="text-sm text-primary-500 font-medium">
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-primary-900 mb-1">
                                            Username
                                        </label>
                                        <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                            {user.username}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-primary-900 mb-1">
                                            Email Address
                                        </label>
                                        <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                            {user.email || 'No email provided'}
                                        </p>
                                    </div>
                                    {/* Additional profile fields could go here */}
                                </div>
                            </div>
                        </div>

                        {/* Task 5: Navigation Placeholder */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-primary-100 rounded-xl shadow-soft p-6">
                                <h2 className="text-xl font-bold text-primary-900 mb-6">Quick Actions</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Placeholder: My Appointments */}
                                    <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-not-allowed bg-gray-50">
                                        <div className="bg-white p-3 rounded-full mb-3 ml-auto mr-auto shadow-sm">
                                            <Calendar className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="font-bold text-gray-500 text-lg mb-1">My Appointments</h3>
                                        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Coming Soon</span>
                                    </div>

                                    {/* Placeholder: Treatment History */}
                                    <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-not-allowed bg-gray-50">
                                        <div className="bg-white p-3 rounded-full mb-3 ml-auto mr-auto shadow-sm">
                                            <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="font-bold text-gray-500 text-lg mb-1">Treatment History</h3>
                                        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Coming Soon</span>
                                    </div>

                                    {/* Placeholder: My Invoices */}
                                    <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-not-allowed bg-gray-50">
                                        <div className="bg-white p-3 rounded-full mb-3 ml-auto mr-auto shadow-sm">
                                            <Receipt className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="font-bold text-gray-500 text-lg mb-1">My Invoices</h3>
                                        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Coming Soon</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PatientDashboard;
