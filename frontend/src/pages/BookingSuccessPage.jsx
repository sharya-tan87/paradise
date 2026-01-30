import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Home } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BookingSuccessPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    // Extract state or use defaults
    const { requestId, name, date, time, service } = location.state || {};

    // Auto-redirect to home after 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    // Format date for display
    const formatDate = (dateValue) => {
        if (!dateValue) return '-';
        try {
            const dateObj = new Date(dateValue);
            return dateObj.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateValue;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-brand-light/10 font-prompt flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
                <div className="max-w-2xl w-full text-center">
                    {/* Success Animation Container */}
                    <div className="mb-8 animate-bounce-slow">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-brand/10 rounded-full">
                            <CheckCircle className="h-16 w-16 text-brand" />
                        </div>
                    </div>

                    {/* Confirmation Heading */}
                    <h1 className="text-brand-dark font-bold text-3xl md:text-4xl mb-4">
                        {t('booking.successPage.title')}
                    </h1>

                    {/* Confirmation Message */}
                    <p className="text-gray-600 text-lg mb-8">
                        {t('booking.successPage.subTitle')}
                    </p>

                    {/* Reference ID */}
                    <div className="bg-brand-light/20 border-2 border-brand rounded-xl p-6 mb-8 inline-block w-full max-w-md shadow-lg">
                        <p className="text-brand-dark font-semibold text-lg">
                            {t('booking.successPage.reference')}
                        </p>
                        <p className="text-brand font-bold text-2xl mt-2">
                            {requestId || 'PENDING'}
                        </p>
                    </div>

                    {/* Appointment Summary - Only show if we have data */}
                    {(name || date || time || service) && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 text-left shadow-lg max-w-md mx-auto">
                            <h2 className="text-brand-dark font-semibold text-xl mb-4 pb-2 border-b border-gray-100">
                                {t('booking.successPage.summaryTitle')}
                            </h2>
                            <div className="space-y-4">
                                {name && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('booking.successPage.name')}:</span>
                                        <span className="font-semibold text-gray-800">{name}</span>
                                    </div>
                                )}
                                {date && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('booking.successPage.date')}:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(date)}</span>
                                    </div>
                                )}
                                {time && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('booking.successPage.time')}:</span>
                                        <span className="font-semibold text-gray-800">{time}</span>
                                    </div>
                                )}
                                {service && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('booking.successPage.service')}:</span>
                                        <span className="font-semibold text-gray-800">{service}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
                        <h3 className="text-brand-dark font-semibold text-lg mb-2">
                            {t('booking.successPage.nextStepsTitle')}
                        </h3>
                        <p className="text-gray-600">
                            {t('booking.successPage.nextStepsMessage')}
                        </p>
                    </div>

                    {/* Countdown and CTA Button */}
                    <div className="space-y-4">
                        <p className="text-gray-500 text-sm">
                            กำลังนำคุณกลับสู่หน้าหลักใน <span className="font-bold text-brand">{countdown}</span> วินาที...
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 bg-brand text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 shadow-lg shadow-brand/20"
                        >
                            <Home className="w-5 h-5" />
                            {t('booking.successPage.returnHome')}
                        </button>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Add custom animation styles */}
            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default BookingSuccessPage;
