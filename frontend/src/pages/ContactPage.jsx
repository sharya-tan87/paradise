import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Clock, Calendar, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white font-prompt flex flex-col overflow-x-hidden">
            <Header />

            <main className="flex-grow -mt-[88px]">
                {/* Hero Section - Premium Modern (Matching Homepage) */}
                <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-0" style={{ background: 'linear-gradient(120deg, #ffffff 0%, #ffffff 60%, rgba(20, 184, 166, 0.15) 100%)' }}>
                    {/* Background Blobs - Enhanced */}
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-brand-light/30 to-blue-200/20 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-brand-light/20 to-purple-100/30 rounded-full blur-3xl opacity-50"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-20 w-full relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                            {/* Mobile Order: Text First, Desktop Order: Mascot First */}
                            {/* Mascot Image - Shows second on mobile, first on desktop (LEFT) */}
                            <div className="relative flex justify-center lg:justify-start lg:h-[700px] items-center order-2 lg:order-1">
                                <img
                                    src="/img/paradise_contact.svg"
                                    alt="Contact Us"
                                    className="w-full max-w-[435px] lg:max-w-[490px] h-auto drop-shadow-2xl animate-float relative z-10 hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </div>

                            {/* Content - Shows first on mobile, second on desktop (RIGHT) */}
                            <div className="text-center lg:text-left space-y-8 animate-fade-in-up order-1 lg:order-2">
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.35] text-primary-900">
                                    {t('contact.hero.title_part1')} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">{t('contact.hero.title_part2')}</span>
                                </h1>

                                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                                    {t('contact.hero.description')}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                                    <Link
                                        to="/booking"
                                        className="group relative bg-brand text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="relative z-10">{t('contact.cta_button')}</span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </Link>
                                    <a
                                        href="tel:0886651546"
                                        className="group bg-white text-brand border-2 border-brand px-10 py-4 rounded-full font-semibold text-lg hover:bg-brand-light/10 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
                                    >
                                        {t('contact.call_now')}
                                    </a>

                                </div>
                            </div>
                        </div>


                    </div>
                </section>

                {/* Contact Information Section - Redesigned based on User Input */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                            {/* Left Column: Info Cards */}
                            <div className="space-y-6">
                                {/* Address Card */}
                                <div className="bg-gray-100 rounded-3xl p-8 flex flex-col md:flex-row gap-6 md:items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 rounded-full border-2 border-brand text-brand flex items-center justify-center bg-white">
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold text-brand flex items-center gap-2">
                                            {t('contact.address_title')}
                                        </h3>
                                        <p className="text-lg text-primary-900 leading-relaxed font-medium">
                                            {t('contact.address_line1')} <br />
                                            {t('contact.address_line2')} <br />
                                            {t('contact.address_line3')}
                                        </p>
                                    </div>
                                </div>

                                {/* Phone Card - Horizontal Strip style */}
                                <div className="bg-gray-100 rounded-full py-4 px-8 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-full border-2 border-brand text-brand flex items-center justify-center bg-white flex-shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <a href="tel:0886651546" className="text-3xl font-bold text-brand hover:text-brand-dark transition-colors">
                                        088 – 6651546
                                    </a>
                                </div>

                                {/* Opening Hours Card */}
                                <div className="bg-gray-100 rounded-3xl p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full border-2 border-brand text-brand flex items-center justify-center bg-white">
                                            <Clock className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-brand">{t('contact.hours')}</h3>
                                    </div>

                                    <div className="space-y-4 text-lg text-text-secondary pl-4 md:pl-20">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                                            <span className="font-semibold text-primary-900 w-48">{t('contact.open_tue_sun')}:</span>
                                            <span>10:00 – 20:00</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                                            <span className="font-semibold text-primary-900 w-48">{t('contact.monday')}:</span>
                                            <span>{t('contact.closed')}</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                                            <span className="font-semibold text-primary-900 w-48">{t('contact.public_holidays')}:</span>
                                            <span>{t('contact.public_holidays_status')}</span>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Map */}
                            <div className="h-full min-h-[500px] w-full bg-gray-100 rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d8359.665061110696!2d101.64978!3d12.775648!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310313b299d0be77%3A0x3eb94c87141aea34!2sParadise%20dental!5e1!3m2!1sen!2sth!4v1766663006679!5m2!1sen!2sth"
                                    className="w-full h-full min-h-[500px]"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>

                        </div>
                    </div>
                </section>

                {/* CTA Section - Matching Homepage Button Style */}
                <section className="py-20 md:py-32 bg-gradient-to-br from-white via-primary-50 to-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-brand-light/20 to-white/0 rounded-full blur-3xl"></div>

                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mb-6 leading-tight">
                            {t('contact.cta_title')}
                        </h2>
                        <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto font-light">
                            {t('contact.cta_subtitle')}
                        </p>

                        {/* Primary Button - Matching Homepage Style */}
                        <Link
                            to="/booking"
                            className="group relative inline-flex items-center gap-3 bg-brand text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10">{t('contact.cta_button')}</span>
                            <Calendar className="h-5 w-5 relative z-10" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
