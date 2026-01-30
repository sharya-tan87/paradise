import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    ShieldCheckIcon,
    SparklesIcon,
    AdjustmentsHorizontalIcon,
    CubeIcon,
    BeakerIcon,
    HeartIcon,
    ScissorsIcon,
    FaceSmileIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
    const { t } = useTranslation();

    const services = [
        { key: "general", icon: ShieldCheckIcon },
        { key: "cosmetic", icon: SparklesIcon },
        { key: "ortho", icon: AdjustmentsHorizontalIcon },
        // Note: 'care' in homepage vs separate services here. I'll align with the more detailed list
        // which I should have added to translation files.
        // Wait, I only have general, cosmetic, ortho, care in 'services' key of en.json (shared with homepage).
        // The ServicesPage had 8 items: General, Cosmetic, Ortho, Implants, Root Canal, Periodontics, Oral Surgery, Pediatric.
        // I need to ensure these keys exist in 'en.json' and 'th.json'!
        // I previously only updated 'services.hero' and kept 'services.general', 'services.cosmetic', 'services.ortho', 'services.care'.
        // I MISSED adding the other 4 services to the translation files!
        // I must address this. For now, I will use what I have and map 'care' to maybe Periodontics?
        // Actually, to do this right, I need to add the missing keys.
        // But to avoid another tool call cycle if possible, I will check what keys I have.
        // I have: general, cosmetic, ortho, care.
        // I need: implants, root_canal, periodontics, oral_surgery, pediatric.
        // I can just map the 4 I have for now, OR I can quickly add more keys in a subsequent step.
        // The user asked to "reimplement". If I drop 4 services, that's a degradation.
        // I should stick to the ones available or add new ones.
        // I will add the missing keys in the code using hardcoded fallbacks if translation is missing? No, that's bad.
        // I will just use the 4 services I have translations for, + maybe reuse them or reduce the list?
        // The previous file had 8 services.
        // I will create a follow-up action to add the missing translations.
        // For this step, I will write the component to EXPECT the keys, and I will update the JSONs immediately after.
        { key: "implants", icon: CubeIcon },
        { key: "root_canal", icon: BeakerIcon },
        { key: "periodontics", icon: HeartIcon },
        { key: "oral_surgery", icon: ScissorsIcon },
        { key: "pediatric", icon: FaceSmileIcon }
    ];

    return (
        <div className="min-h-screen bg-white font-prompt flex flex-col overflow-x-hidden">
            <Header />

            <main className="flex-grow -mt-[88px]">
                {/* Hero Section - Same Style as HomePage */}
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
                                    src="/img/paradise_service.svg"
                                    alt="Our Services"
                                    className="w-full max-w-[435px] lg:max-w-[490px] h-auto drop-shadow-2xl animate-float relative z-10 hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </div>

                            {/* Content - Shows first on mobile, second on desktop (RIGHT) */}
                            <div className="text-center lg:text-left space-y-8 animate-fade-in-up order-1 lg:order-2">
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.35] text-primary-900">
                                    {t('services.hero.title_part1')} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">{t('services.hero.title_part2')}</span>
                                </h1>

                                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                                    {t('services.hero.description')}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                                    <Link
                                        to="/booking"
                                        className="group relative bg-brand text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="relative z-10">{t('services.hero.cta_primary')}</span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </Link>
                                    <a
                                        href="#list"
                                        className="group bg-white text-brand border-2 border-brand px-10 py-4 rounded-full font-semibold text-lg hover:bg-brand-light/10 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
                                    >
                                        {t('services.hero.cta_secondary')}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators - Below CTAs, Centered */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-12 pb-8 text-sm font-medium text-text-secondary w-full">
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('services.hero.trust_1')}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('services.hero.trust_2')}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('services.hero.trust_3')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section id="list" className="py-24 md:py-32 lg:py-40 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                            {services.map((service, index) => (
                                <div key={index} className="bg-white rounded-xl border border-primary-100 shadow-soft p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                                    <div className="h-16 w-16 rounded-full bg-brand-light flex items-center justify-center mb-6 group-hover:bg-brand-DEFAULT transition-colors duration-300">
                                        <service.icon className="h-8 w-8 text-brand-DEFAULT group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-primary-900 mb-4 group-hover:text-brand-DEFAULT transition-colors duration-300">
                                        {t(`services.${service.key}.title`)}
                                    </h3>
                                    <p className="text-text-secondary leading-relaxed mb-6">
                                        {t(`services.${service.key}.desc`)}
                                    </p>
                                    <a href="#" className="inline-flex items-center text-brand-DEFAULT font-medium hover:text-brand-dark transition-colors">
                                        {t('services.hero.cta_secondary')}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ServicesPage;
