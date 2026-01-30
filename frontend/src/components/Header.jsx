import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, LogIn, Globe, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        setIsAuthenticated(!!token);
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Lock Language to Thai if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            if (i18n.language !== 'th') {
                i18n.changeLanguage('th');
            }
        }
    }, [isAuthenticated, i18n]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
    }, [navigate]);

    // Handle scroll for sticky header shadow and background opacity
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Click outside to close profile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleLanguage = () => {
        if (isAuthenticated) return; // Lock if authenticated
        const newLang = i18n.language === 'en' ? 'th' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to home - Force full reload to clear all states
        window.location.href = '/';
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        if (user.role === 'patient') return '/dashboard/patient';
        // For all other roles (staff, dentist, manager, admin)
        return '/dashboard/staff';
    };

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "bg-primary-50 text-primary-900 px-4 py-2 rounded-lg font-semibold font-prompt transition-colors"
            : "text-primary-900 hover:text-brand px-4 py-2 transition-colors font-prompt font-medium";

    const mobileNavLinkClass = ({ isActive }) =>
        isActive
            ? "block px-4 py-3 rounded-md text-base font-semibold text-primary-900 bg-primary-50 font-prompt"
            : "block px-4 py-3 rounded-md text-base font-medium text-primary-900 hover:text-brand hover:bg-primary-50 font-prompt";

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
                }`}
        >
            <div className={`${isAuthenticated ? 'w-full px-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center group">
                            <img src="/img/paradise-logo.png" alt="Paradise Dental Clinic" className="h-[53px] w-auto" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    {!isAuthenticated && (
                        <nav className="hidden lg:flex items-center space-x-1">
                            <NavLink to="/" className={navLinkClass}>
                                {t('header.home')}
                            </NavLink>
                            <NavLink to="/about" className={navLinkClass}>
                                {t('header.about')}
                            </NavLink>
                            <NavLink to="/services" className={navLinkClass}>
                                {t('header.services')}
                            </NavLink>
                            <NavLink to="/contact" className={navLinkClass}>
                                {t('header.contact')}
                            </NavLink>
                        </nav>
                    )}

                    {/* Desktop Action Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {!isAuthenticated && (
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1 text-primary-900 hover:text-brand font-medium font-prompt px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors uppercase"
                                aria-label="Toggle language"
                            >
                                <Globe className="h-5 w-5" />
                                <span>{i18n.language}</span>
                            </button>
                        )}

                        {/* If authenticated, show Locked Language Indicator optionally or nothing. 
                            Users request: "language is lock to thai". 
                            We can show just "TH" no button, or hide it. 
                            Let's show it as static text or just hide to reduce clutter if it's forced.
                            The request implies visual lock or just behavior. 
                            If I hide it, it's definitely locked.
                        */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-1 text-gray-500 font-medium font-prompt px-3 py-2 rounded-lg uppercase cursor-default">
                                <Globe className="h-5 w-5" />
                                <span>TH</span>
                            </div>
                        )}

                        {isAuthenticated ? (
                            <div className="relative profile-menu-container">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 bg-white border border-gray-200 text-primary-900 px-4 py-2 rounded-lg font-medium font-prompt hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                                >
                                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <span className="max-w-[100px] truncate">
                                        {user?.username || 'User'}
                                    </span>
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 origin-top-right transform transition-all duration-200 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user?.username}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate capitalize">
                                                {user?.role}
                                            </p>
                                        </div>

                                        <Link
                                            to={getDashboardLink()}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <LayoutDashboard className="h-4 w-4 mr-2" />
                                            {/* Hardcoded Thai or translated? "dashboard" key might exist. 
                                                If locked to TH, I can use TH directly or t('dashboard'). 
                                                I'll assume t('dashboard') exists, if not I'll fallback to "Dashboard"
                                                Wait, if I lock to TH, I should rely on translations.
                                                But I need to ensure 'dashboard' key exists. 
                                                I'll Check en.json/th.json later. For now, hardcode "Dashboard" / "แดชบอร์ด" or use key.
                                                Since I don't know if 'common.dashboard' exists, I will use English/Thai conditional or just key.
                                            */}
                                            {t('dashboard.title', 'Dashboard')}
                                        </Link>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            {t('header.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 text-primary-900 hover:text-brand font-medium font-prompt px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                                <LogIn className="h-5 w-5" />
                                <span>{t('header.login')}</span>
                            </Link>
                        )}

                        {(!isAuthenticated || (user && user.role === 'patient')) && (
                            <Link
                                to="/booking"
                                className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full font-prompt font-semibold hover:bg-brand-dark transition-all duration-300 shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1"
                            >
                                <Calendar className="h-5 w-5" />
                                <span>{t('header.bookAppointment')}</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center lg:hidden gap-4">
                        {!isAuthenticated && (
                            <button
                                onClick={toggleLanguage}
                                className="text-primary-900 font-medium font-prompt uppercase"
                            >
                                {i18n.language}
                            </button>
                        )}
                        {isAuthenticated && (
                            <span className="text-gray-500 font-medium font-prompt uppercase">TH</span>
                        )}

                        <button
                            onClick={toggleMobileMenu}
                            type="button"
                            className="text-primary-900 hover:text-brand p-2 rounded-md focus:outline-none transition-colors"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-8 w-8" />
                            ) : (
                                <Menu className="h-8 w-8" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div
                className={`lg:hidden bg-white border-t border-primary-100 overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-4 pt-4 pb-6 space-y-2 shadow-inner">
                    {!isAuthenticated && (
                        <>
                            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>
                                {t('header.home')}
                            </NavLink>
                            <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>
                                {t('header.about')}
                            </NavLink>
                            <NavLink to="/services" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>
                                {t('header.services')}
                            </NavLink>
                            <NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>
                                {t('header.contact')}
                            </NavLink>
                        </>
                    )}

                    <div className="border-t border-primary-100 my-4 pt-4 space-y-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={getDashboardLink()}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full text-primary-900 hover:text-brand font-medium font-prompt py-3 rounded-lg hover:bg-primary-50 active:bg-primary-100 transition-colors"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span>{t('dashboard.title', 'Dashboard')}</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full text-red-600 hover:text-red-700 font-medium font-prompt py-3 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>{t('header.logout')}</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full text-primary-900 hover:text-brand font-medium font-prompt py-3 rounded-lg hover:bg-primary-50 active:bg-primary-100 transition-colors"
                            >
                                <LogIn className="h-5 w-5" />
                                <span>{t('header.login')}</span>
                            </Link>
                        )}

                        {(!isAuthenticated || (user && user.role === 'patient')) && (
                            <Link
                                to="/booking"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full bg-brand text-white py-3.5 rounded-full font-prompt font-semibold hover:bg-brand-dark transition-all duration-300 shadow-lg shadow-brand/30 active:transform active:scale-95"
                            >
                                <Calendar className="h-5 w-5" />
                                <span>{t('header.bookAppointment')}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
