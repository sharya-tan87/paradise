import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    List,
    Users,
    Calendar,
    CalendarDays,
    Stethoscope,
    DollarSign,
    BarChart,
    Settings,
    Menu,
    X,
    Package
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';

const DashboardLayout = ({ children, title, actions }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    // Helper for role access
    const canAccessFeature = (userRole, requiredRoles) => {
        return requiredRoles.includes(userRole);
    };

    const navItems = [
        {
            id: 'dashboard',
            label: t('staffDashboard.nav.dashboard'),
            icon: LayoutDashboard,
            roles: ['staff', 'dentist', 'manager', 'admin'],
            path: user ? `/dashboard/${user.role}` : '/dashboard'
        },
        {
            id: 'myAppointments',
            label: t('dentistAppointments.title') || 'My Appointments',
            icon: CalendarDays,
            roles: ['dentist'],
            path: '/dashboard/my-appointments'
        },
        { id: 'appointmentSchedule', label: t('staffDashboard.nav.appointmentSchedule'), icon: Calendar, roles: ['manager', 'admin', 'staff'], path: '/dashboard/appointments' },
        { id: 'patients', label: t('staffDashboard.nav.patients'), icon: Users, roles: ['staff', 'dentist', 'manager', 'admin'], path: '/dashboard/patients' },
        { id: 'queue', label: t('staffDashboard.nav.queue'), icon: List, roles: ['staff', 'manager', 'admin'], path: '/dashboard/queue' },
        { id: 'treatments', label: t('staffDashboard.nav.treatments'), icon: Stethoscope, roles: ['staff', 'dentist', 'manager', 'admin'], path: '/dashboard/treatments' },
        { id: 'billing', label: t('staffDashboard.nav.billing'), icon: DollarSign, roles: ['staff', 'manager', 'admin'], path: '/dashboard/billing' },
        { id: 'services', label: t('staffDashboard.nav.services'), icon: Stethoscope, roles: ['admin', 'manager', 'staff'], path: '/dashboard/admin/services' },
        { id: 'expenses', label: t('staffDashboard.nav.expenses'), icon: Package, roles: ['staff', 'manager', 'admin'], path: '/dashboard/expenses' },
        { id: 'reports', label: t('staffDashboard.nav.reports'), icon: BarChart, roles: ['manager', 'admin'], path: '/dashboard/analytics' },
        { id: 'admin', label: t('staffDashboard.nav.admin'), icon: Settings, roles: ['admin', 'manager', 'staff'], path: '/dashboard/admin/users' }
    ];

    if (!user) return null; // Or a loader

    const visibleNavItems = navItems.filter(item => canAccessFeature(user.role, item.roles));

    // Determine active item
    const isItemActive = (path) => {
        if (!path) return false;
        // Exact match or sub-path match?
        // Using `startsWith` for sub-paths (e.g. /dashboard/queue/details)
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-white font-prompt flex flex-col">
            <Header />

            <div className="flex flex-grow relative">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 bg-white border-r border-primary-100 flex-shrink-0">
                    <div className="p-6 sticky top-0">
                        <h2 className="text-primary-900 font-bold text-lg mb-6 uppercase tracking-wider text-center">{t('staffDashboard.menu')}</h2>
                        <nav className="space-y-2">
                            {visibleNavItems.map(item => {
                                const isActive = isItemActive(item.path);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => !item.comingSoon && item.path && navigate(item.path)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors cursor-pointer ${isActive
                                            ? 'bg-primary-50 text-primary-900 border-primary-100 font-semibold'
                                            : 'border-transparent text-primary-900 hover:bg-primary-50'
                                            } ${item.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : (item.comingSoon ? 'text-gray-400' : 'text-primary-500')}`} />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.comingSoon && (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{t('staffDashboard.nav.soon')}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-primary-900 font-bold text-lg uppercase tracking-wider">{t('staffDashboard.menu')}</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="h-6 w-6 text-primary-900" />
                                </button>
                            </div>
                            <nav className="space-y-4">
                                {visibleNavItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            if (!item.comingSoon && item.path) {
                                                navigate(item.path);
                                                setIsMobileMenuOpen(false);
                                            }
                                        }}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg border border-transparent ${isItemActive(item.path)
                                            ? 'bg-primary-50 text-primary-900 font-semibold'
                                            : 'text-primary-900 hover:bg-primary-50'
                                            } cursor-pointer`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`h-5 w-5 ${item.comingSoon ? 'text-gray-400' : 'text-primary-500'}`} />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.comingSoon && (
                                            <span className="text-[10px] bg-primary-50 text-primary-900 px-2 py-0.5 rounded-full font-bold">{t('staffDashboard.nav.soon')}</span>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-grow p-4 sm:p-6 lg:p-8 bg-gray-50/30 max-w-7xl mx-auto w-full md:w-[calc(100%-16rem)]">
                    {/* Mobile Toggle Button */}
                    <div className="md:hidden mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-primary-900">{title || t('staffDashboard.nav.dashboard')}</h1>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-primary-900 hover:bg-primary-50 rounded-lg"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Page Content */}
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardLayout;
