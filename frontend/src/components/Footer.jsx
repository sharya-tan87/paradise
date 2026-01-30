import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in by checking localStorage for user or accessToken
        const checkAuth = () => {
            const user = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');
            setIsAuthenticated(!!(user || accessToken));
        };

        checkAuth();

        // Listen for storage changes to update authentication status
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return (
        <footer className="bg-white border-t border-brand-light font-prompt">
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isAuthenticated ? 'py-4' : 'py-12 md:py-16'}`}>
                {!isAuthenticated && (
                    <>
                        {/* Top: Clinic Logo */}
                        <div className="mb-8">
                            <img
                                src="/img/paradise-logo.png"
                                alt="Paradise Dental Clinic"
                                className="h-12 w-auto"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8">
                            {/* Left Column: About Description + Social Buttons */}
                            <div className="space-y-4">
                                <p className="text-text-secondary leading-relaxed text-sm mb-4">
                                    {t('footer.about_description')}
                                </p>

                                {/* Social Buttons in Single Line */}
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="https://line.me/ti/p/~paradisedental"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-lg hover:bg-[#05B04B] transition-colors text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                                        </svg>
                                        {t('footer.line_button')}
                                    </a>
                                    <a
                                        href="https://facebook.com/paradisedental"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg hover:bg-[#0C63D4] transition-colors text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        {t('footer.facebook_button')}
                                    </a>
                                </div>
                            </div>

                        {/* Center Column: Quick Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-brand-dark mb-4">
                                {t('footer.quick_links_title')}
                            </h3>
                            <nav className="flex flex-col space-y-3">
                                <Link
                                    to="/"
                                    className="text-text-secondary hover:text-brand transition-colors text-sm"
                                >
                                    {t('footer.links.home')}
                                </Link>
                                <Link
                                    to="/services"
                                    className="text-text-secondary hover:text-brand transition-colors text-sm"
                                >
                                    {t('footer.links.services')}
                                </Link>
                                <Link
                                    to="/about"
                                    className="text-text-secondary hover:text-brand transition-colors text-sm"
                                >
                                    {t('footer.links.about')}
                                </Link>
                                <Link
                                    to="/contact"
                                    className="text-text-secondary hover:text-brand transition-colors text-sm"
                                >
                                    {t('footer.links.contact')}
                                </Link>
                                <Link
                                    to="/booking"
                                    className="text-text-secondary hover:text-brand transition-colors text-sm"
                                >
                                    {t('footer.links.booking')}
                                </Link>
                            </nav>
                        </div>

                        {/* Right Column: Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-brand-dark mb-4">
                                {t('footer.contact_title')}
                            </h3>

                            {/* Address */}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-brand flex-shrink-0 mt-1" />
                                <p className="text-text-secondary leading-relaxed text-sm">
                                    {t('footer.address')}
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-brand flex-shrink-0" />
                                <a
                                    href="tel:0886651546"
                                    className="text-text-secondary hover:text-brand transition-colors text-sm"
                                >
                                    {t('footer.phone')}
                                </a>
                            </div>
                        </div>
                    </div>
                    </>
                )}

                {/* Copyright */}
                <div className={`${isAuthenticated ? '' : 'border-t border-brand-light pt-8'} flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary text-center md:text-left`}>
                    <p>
                        {t('footer.copyright').replace('2025', currentYear)}
                    </p>
                    <div className="flex space-x-6">
                        <Link to="/privacy" className="hover:text-brand transition-colors">{t('footer.privacy')}</Link>
                        <Link to="/terms" className="hover:text-brand transition-colors">{t('footer.terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
