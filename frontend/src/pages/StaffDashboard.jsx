import React, { useState, useEffect } from 'react';
import {
    User, Calendar, Clock, Activity,
    ClipboardList, ChevronRight, UserCog,
    Stethoscope, Users, MapPin, GraduationCap,
    Award, Quote, Hash, Wallet, Edit3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DentistProfileModal from '../components/DentistProfileModal';
import StaffProfileModal from '../components/StaffProfileModal';
import { getDentistProfileByUserId, getDentistDashboardMetrics } from '../services/api';

const StaffDashboard = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isStaffProfileModalOpen, setIsStaffProfileModalOpen] = useState(false);
    const [dentistProfile, setDentistProfile] = useState(null);
    const [stats, setStats] = useState({
        todayAppointments: 0,
        waitingQueue: 0,
        nextPatient: null,
        avgWait: '0m'
    });
    const [staffStats, setStaffStats] = useState({
        todayAppointments: 0,
        waitingQueue: 0,
        patientsToday: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        newPatientsToday: 0
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                if (userData.role === 'dentist') {
                    loadDentistProfile(userData.id);
                } else {
                    loadStaffStats();
                }
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const loadDentistProfile = async (userId) => {
        try {
            const profile = await getDentistProfileByUserId(userId);
            setDentistProfile(profile);

            // Load dashboard stats
            const metrics = await getDentistDashboardMetrics();
            setStats(metrics);
        } catch (error) {
            console.error("Failed to load dentist profile or metrics", error);
        }
    };

    const loadStaffStats = async () => {
        try {
            // Try to get dashboard analytics if available
            const today = new Date().toISOString().split('T')[0];

            // Fetch appointments for today count (simplified - real implementation would use a dedicated endpoint)
            const { getCalendarAppointments, searchPatients } = await import('../services/api');

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const appointmentsRes = await getCalendarAppointments({
                start: startOfDay.toISOString(),
                end: endOfDay.toISOString()
            });

            // API returns data directly or wrapped - handle both cases
            const appointments = Array.isArray(appointmentsRes) ? appointmentsRes : (appointmentsRes?.data || []);
            const completed = appointments.filter(a => a.status === 'completed').length;
            const pending = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length;
            const inQueue = appointments.filter(a => a.status === 'in-progress').length;

            setStaffStats({
                todayAppointments: appointments.length,
                waitingQueue: inQueue,
                patientsToday: appointments.length,
                completedAppointments: completed,
                pendingAppointments: pending,
                newPatientsToday: 0 // Would need a dedicated API for this
            });
        } catch (error) {
            console.error("Failed to load staff stats", error);
            // Keep default values
        }
    };

    if (!user) {
        return null;
    }

    const isDentist = user.role === 'dentist';

    // Data from stats
    const { todayAppointments, waitingQueue, nextPatient, avgWait } = stats;

    const renderDentistDashboard = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Work Dashboard */}
            <div className="lg:col-span-2 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{t('dentistDashboard.todaysAppointments')}</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-2">{todayAppointments}</h3>
                            </div>
                            <div className="bg-blue-50 p-2.5 rounded-xl">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
                            <span className="text-green-500 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                <Activity size={12} /> +2 New
                            </span>
                            <span className="ml-2">since yesterday</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{t('dentistDashboard.waitingQueue')}</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-2">{waitingQueue}</h3>
                            </div>
                            <div className="bg-orange-50 p-2.5 rounded-xl">
                                <Users className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-full">{t('dentistDashboard.avgWait', { time: avgWait })}</span>
                        </div>
                    </div>

                    <div
                        onClick={() => setIsProfileModalOpen(true)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{t('dentistDashboard.workSchedule')}</p>
                                <h3 className="text-lg font-bold text-slate-800 mt-2">
                                    {dentistProfile?.workingHours ? `${dentistProfile.workingHours.start} - ${dentistProfile.workingHours.end}` : '09:00 - 17:00'}
                                </h3>
                            </div>
                            <div className="bg-teal-50 p-2.5 rounded-xl group-hover:bg-teal-100 transition-colors">
                                <Clock className="w-5 h-5 text-teal-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
                            <span className="text-teal-600 font-semibold">{t('dentistDashboard.onDuty')}</span>
                            <span className="ml-auto text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                        </div>
                    </div>
                </div>

                {/* Next Patient Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10">
                        <Stethoscope size={150} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">
                                    {t('dentistDashboard.nextPatient')}
                                </h2>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {nextPatient ? (
                                        <>
                                            {nextPatient.name}
                                            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white font-normal">{nextPatient.id}</span>
                                        </>
                                    ) : (
                                        t('dentistDashboard.noAppointments')
                                    )}
                                </h3>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Clock size={14} />
                                <span className="font-semibold">{nextPatient?.time || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            {nextPatient && (
                                <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                                    <p className="text-xs text-indigo-200 mb-0.5">{t('staffDashboard.nav.treatments')}</p>
                                    <p className="font-medium">{nextPatient.treatment || 'N/A'}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/dashboard/treatments')}
                                className="bg-white text-indigo-700 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Activity size={18} />
                                {t('dentistDashboard.startTreatment')}
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/my-appointments')}
                                className="bg-indigo-500/30 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-500/40 transition-colors backdrop-blur-md border border-indigo-400/30"
                            >
                                {t('dentistAppointments.title') || 'My Appointments'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Items / Quick Actions */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{t('dentistDashboard.quickActions')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/dashboard/treatments')}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all group text-left"
                        >
                            <div className="mb-3 bg-teal-50 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ClipboardList className="text-teal-600" size={20} />
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">{t('staffDashboard.nav.treatments')}</p>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/my-appointments')}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group text-left"
                        >
                            <div className="mb-3 bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Calendar className="text-blue-600" size={20} />
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">{t('dentistAppointments.title') || 'My Appointments'}</p>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/patients')}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all group text-left"
                        >
                            <div className="mb-3 bg-purple-50 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="text-purple-600" size={20} />
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">{t('staffDashboard.nav.patients')}</p>
                        </button>
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-pink-200 hover:shadow-md transition-all group text-left"
                        >
                            <div className="mb-3 bg-pink-50 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserCog className="text-pink-600" size={20} />
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">{t('staffDashboard.myProfile')}</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column - Profile Card */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-8 flex flex-col group/card hover:shadow-md transition-shadow">
                    {/* Header Image & Avatar */}
                    <div className="relative">
                        <div className="h-32 bg-gradient-to-r from-brand to-brand-dark relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 pattern-dots-sm opacity-30"></div>
                            {/* Decorative Circles */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-xl"></div>
                        </div>

                        <div className="px-6 relative flex justify-between items-end -mt-12 mb-4">
                            <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-lg relative overflow-hidden group mb-0">
                                {dentistProfile?.imagePath ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'}${dentistProfile.imagePath}`}
                                        alt={user.username}
                                        className="w-full h-full object-cover rounded-xl bg-slate-100"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <User size={40} />
                                    </div>
                                )}
                                <button
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer backdrop-blur-sm"
                                    onClick={() => setIsProfileModalOpen(true)}
                                >
                                    <UserCog size={24} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="mb-1 text-xs font-bold text-brand hover:text-brand-dark bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                            >
                                <UserCog size={14} />
                                {t('dentistDashboard.editProfile')}
                            </button>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="px-6 pb-6 space-y-6">
                        {/* Name & Title */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{user.username}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs font-bold text-brand-dark px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 uppercase tracking-wider">
                                    {t('staffDashboard.role.dentist')}
                                </span>
                                {dentistProfile?.licenseNumber && (
                                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                        <Hash size={12} className="text-slate-400" />
                                        {dentistProfile.licenseNumber}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="relative bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Quote size={24} className="absolute -top-3 -left-2 text-brand bg-white rounded-full p-0.5 border border-slate-100 shadow-sm" />
                            <p className="text-slate-600 text-sm leading-relaxed italic">
                                {i18n.language === 'th' && dentistProfile?.bioTh
                                    ? dentistProfile.bioTh
                                    : (dentistProfile?.bio || t('staffDashboard.noBio') || 'No biography added yet.')}
                            </p>
                        </div>

                        <div className="w-full h-px bg-slate-100"></div>

                        {/* Information Grid */}
                        <div className="space-y-5">
                            {/* Specializations */}
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    <Award size={14} className="text-brand" />
                                    {t('dentistProfile.section.specializations')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {dentistProfile?.specializations?.length > 0 ? (
                                        dentistProfile.specializations.map((spec, i) => (
                                            <span key={i} className="px-3 py-1.5 text-xs font-semibold text-brand-dark bg-blue-50 border border-blue-200/60 rounded-lg capitalize">
                                                {spec}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic px-2">
                                            No specializations added
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Services */}
                            {dentistProfile?.services?.length > 0 && (
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        <Stethoscope size={14} className="text-indigo-500" />
                                        {t('dentistProfile.section.services')}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {dentistProfile.services.map((service, i) => (
                                            <span key={i} className="px-2 py-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md">
                                                {i18n.language === 'th' ? service.nameTh : service.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {dentistProfile?.education?.length > 0 && (
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        <GraduationCap size={14} className="text-blue-500" />
                                        {t('dentistProfile.section.education')}
                                    </h4>
                                    <ul className="space-y-3 pl-1">
                                        {dentistProfile.education.map((edu, i) => (
                                            <li key={i} className="flex gap-3 text-sm relative pl-4 border-l-2 border-slate-100 hover:border-blue-300 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-slate-700 text-xs">{edu.degree}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{edu.institution} • {edu.year}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Working Hours */}
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    <Clock size={14} className="text-orange-500" />
                                    {t('dentistProfile.section.schedule')}
                                </h4>
                                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-slate-600">{t('dentistProfile.form.availableDays')}</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5, 6, 0].map(d => {
                                                const isActive = dentistProfile?.availableDays?.includes(d);
                                                let label = '';
                                                if (d === 1) label = 'M';
                                                if (d === 2) label = 'T';
                                                if (d === 3) label = 'W';
                                                if (d === 4) label = 'T';
                                                if (d === 5) label = 'F';
                                                if (d === 6) label = 'S';
                                                if (d === 0) label = 'S';

                                                return (
                                                    <div
                                                        key={d}
                                                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors ${isActive
                                                            ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm'
                                                            : 'bg-slate-50 text-slate-300 border-transparent'
                                                            }`}
                                                        title={isActive ? 'Available' : 'Unavailable'}
                                                    >
                                                        {label}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                                        <span className="text-slate-500 font-medium">Duty Hours</span>
                                        <div className="flex items-center gap-1.5 font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                            <Clock size={10} className="text-slate-400" />
                                            {dentistProfile?.workingHours ? `${dentistProfile.workingHours.start} - ${dentistProfile.workingHours.end}` : '09:00 - 17:00'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Consultation Fee */}
                            {dentistProfile?.consultationFee && (
                                <div className="pt-2">
                                    <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-100 p-1.5 rounded-lg text-brand-dark">
                                                <Wallet size={14} />
                                            </div>
                                            <span className="text-xs font-medium text-brand-dark">{t('dentistProfile.form.consultationFee')}</span>
                                        </div>
                                        <span className="font-bold text-brand">฿{Number(dentistProfile.consultationFee).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DentistProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => {
                    setIsProfileModalOpen(false);
                    loadDentistProfile(user.id); // Reload profile after edit
                }}
                userId={user.id}
                userName={user.username}
            />
        </div>
    );

    const renderDefaultDashboard = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Work Dashboard */}
            <div className="lg:col-span-2 space-y-8">
                {/* Welcome Section - Desktop */}
                <div className="hidden md:block">
                    <h1 className="text-3xl font-bold text-primary-900">
                        {t('staffDashboard.welcome', { name: user.username })}
                        <span className={`ml-3 text-sm px-3 py-1 rounded-full text-white align-middle ${user.role === 'admin' ? 'bg-red-500' :
                            user.role === 'manager' ? 'bg-orange-500' :
                                user.role === 'dentist' ? 'bg-purple-500' :
                                    'bg-primary-500'
                            }`}>
                            {t(`staffDashboard.role.${user.role}`, user.role.charAt(0).toUpperCase() + user.role.slice(1))}
                        </span>
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t('staffDashboard.accessTools')}
                    </p>
                </div>

                {/* Mobile Welcome Section (Condensed) */}
                <div className="md:hidden mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-primary-900">{user.username}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${user.role === 'admin' ? 'bg-red-500' :
                            user.role === 'manager' ? 'bg-orange-500' :
                                user.role === 'dentist' ? 'bg-purple-500' :
                                    'bg-primary-500'
                            }`}>
                            {t(`staffDashboard.role.${user.role}`, user.role.charAt(0).toUpperCase() + user.role.slice(1))}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {t('staffDashboard.accessTools')}
                    </p>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Today's Appointments */}
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-teal-100 text-sm font-medium">{t('staffDashboard.widgets.todayAppointments')}</p>
                                <p className="text-3xl font-bold mt-1">{staffStats.todayAppointments}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <Calendar className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <button
                                onClick={() => navigate('/dashboard/appointments')}
                                className="text-sm flex items-center gap-1 hover:gap-2 transition-all text-teal-100 hover:text-white"
                            >
                                {t('staffDashboard.widgets.viewAll')} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Queue Status */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">{t('staffDashboard.widgets.queueStatus')}</p>
                                <p className="text-3xl font-bold mt-1">{staffStats.waitingQueue}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <button
                                onClick={() => navigate('/dashboard/queue')}
                                className="text-sm flex items-center gap-1 hover:gap-2 transition-all text-blue-100 hover:text-white"
                            >
                                {t('staffDashboard.widgets.manageQueue')} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Patients Today */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">{t('staffDashboard.widgets.patientsToday')}</p>
                                <p className="text-3xl font-bold mt-1">{staffStats.patientsToday}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <button
                                onClick={() => navigate('/dashboard/patients')}
                                className="text-sm flex items-center gap-1 hover:gap-2 transition-all text-purple-100 hover:text-white"
                            >
                                {t('staffDashboard.widgets.viewPatients')} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-primary-100 rounded-xl shadow-soft p-6 mb-6">
                    <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary-500" />
                        {t('staffDashboard.widgets.quickActions')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            onClick={() => navigate('/dashboard/appointments')}
                            className="flex flex-col items-center p-4 bg-gray-50 hover:bg-teal-50 rounded-xl transition-colors group"
                        >
                            <div className="bg-teal-100 p-3 rounded-full mb-2 group-hover:bg-teal-200 transition-colors">
                                <Calendar className="h-5 w-5 text-teal-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{t('staffDashboard.widgets.newAppointment')}</span>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard/patients')}
                            className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group"
                        >
                            <div className="bg-blue-100 p-3 rounded-full mb-2 group-hover:bg-blue-200 transition-colors">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{t('staffDashboard.widgets.registerPatient')}</span>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard/queue')}
                            className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors group"
                        >
                            <div className="bg-purple-100 p-3 rounded-full mb-2 group-hover:bg-purple-200 transition-colors">
                                <ClipboardList className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{t('staffDashboard.widgets.manageQueue')}</span>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard/billing')}
                            className="flex flex-col items-center p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors group"
                        >
                            <div className="bg-green-100 p-3 rounded-full mb-2 group-hover:bg-green-200 transition-colors">
                                <Wallet className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{t('staffDashboard.widgets.billing')}</span>
                        </button>
                    </div>
                </div>

                {/* Today's Summary */}
                <div className="bg-white border border-primary-100 rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-bold text-primary-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary-500" />
                        {t('staffDashboard.widgets.todaySummary')}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">{t('staffDashboard.widgets.completedAppointments')}</span>
                            <span className="font-bold text-green-600">{staffStats.completedAppointments}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">{t('staffDashboard.widgets.pendingAppointments')}</span>
                            <span className="font-bold text-orange-600">{staffStats.pendingAppointments}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">{t('staffDashboard.widgets.newPatients')}</span>
                            <span className="font-bold text-blue-600">{staffStats.newPatientsToday}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Profile Card */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-8 flex flex-col group/card hover:shadow-md transition-shadow">
                    {/* Header Image & Avatar */}
                    <div className="relative">
                        <div className={`h-32 relative overflow-hidden ${user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            user.role === 'manager' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                'bg-gradient-to-r from-brand to-brand-dark'
                            }`}>
                            <div className="absolute inset-0 bg-white/10 pattern-dots-sm opacity-30"></div>
                            {/* Decorative Circles */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-xl"></div>
                        </div>

                        <div className="px-6 relative flex justify-between items-end -mt-12 mb-4">
                            <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-lg relative overflow-hidden group mb-0">
                                {user.imagePath ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'}${user.imagePath}`}
                                        alt={user.username}
                                        className="w-full h-full object-cover rounded-xl bg-slate-100"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <User size={40} />
                                    </div>
                                )}
                                <button
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer backdrop-blur-sm"
                                    onClick={() => setIsStaffProfileModalOpen(true)}
                                >
                                    <UserCog size={24} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsStaffProfileModalOpen(true)}
                                className="mb-1 text-xs font-bold text-brand hover:text-brand-dark bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Edit3 size={14} />
                                {t('staffDashboard.editProfile')}
                            </button>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="px-6 pb-6 space-y-6">
                        {/* Name & Title */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{user.username}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${user.role === 'admin' ? 'text-red-700 bg-red-50 border border-red-100' :
                                    user.role === 'manager' ? 'text-orange-700 bg-orange-50 border border-orange-100' :
                                        'text-brand-dark bg-blue-50 border border-blue-100'
                                    }`}>
                                    {t(`staffDashboard.role.${user.role}`, user.role.charAt(0).toUpperCase() + user.role.slice(1))}
                                </span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-100"></div>

                        {/* Staff Information */}
                        <div className="space-y-4">
                            {/* Staff ID */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                    <Hash size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">{t('staffDashboard.staffId')}</p>
                                    <p className="text-sm font-bold text-slate-700">{user.id.substring(0, 8)}...</p>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <User size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">{t('staffDashboard.username')}</p>
                                    <p className="text-sm font-bold text-slate-700">{user.username}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-teal-100 p-2 rounded-lg">
                                    <MapPin size={16} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">{t('staffDashboard.email')}</p>
                                    <p className="text-sm font-bold text-slate-700">{user.email || t('staffDashboard.noEmail')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StaffProfileModal
                isOpen={isStaffProfileModalOpen}
                onClose={() => setIsStaffProfileModalOpen(false)}
                user={user}
                onProfileUpdate={(updatedUser) => setUser(updatedUser)}
            />
        </div>
    );

    return (
        <DashboardLayout title={t('staffDashboard.nav.dashboard')}>
            {isDentist ? renderDentistDashboard() : renderDefaultDashboard()}
        </DashboardLayout>
    );
};

export default StaffDashboard;


