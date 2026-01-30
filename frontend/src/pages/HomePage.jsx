import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheckIcon, SparklesIcon, AdjustmentsHorizontalIcon, HeartIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white font-prompt flex flex-col overflow-x-hidden">
            <Header />

            <main className="flex-grow -mt-[88px]">
                {/* Hero Section - Premium Modern */}
                <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-0" style={{ background: 'linear-gradient(120deg, #ffffff 0%, #ffffff 60%, rgba(20, 184, 166, 0.15) 100%)' }}>
                    {/* Background Blobs - Enhanced */}
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-brand-light/30 to-blue-200/20 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
                    <div className="absolute bottom-[-5%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-brand-light/20 to-purple-100/30 rounded-full blur-3xl opacity-50"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-20 w-full relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                            {/* Mobile Order: Text First, Desktop Order: Mascot First */}
                            {/* Mascot Image - Shows second on mobile, first on desktop (LEFT) */}
                            <div className="relative flex justify-center lg:justify-start lg:h-[700px] items-center order-2 lg:order-1">
                                <img
                                    src="/img/paradise-mascot.svg"
                                    alt="Paradise Dental Mascot"
                                    className="w-full max-w-[435px] lg:max-w-[490px] h-auto drop-shadow-2xl animate-float relative z-10 hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </div>

                            {/* Content - Shows first on mobile, second on desktop (LEFT) */}
                            <div className="text-center lg:text-left space-y-8 animate-fade-in-up order-1 lg:order-2">
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.35] text-primary-900">
                                    {t('hero.title_part1')} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">{t('hero.title_part2')}</span>
                                </h1>

                                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                                    {t('hero.description')}
                                </p>

                                <div className="flex flex-row gap-5 justify-center lg:justify-start pt-4">
                                    <Link
                                        to="/booking"
                                        className="group relative bg-brand text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="relative z-10">{t('hero.cta_primary')}</span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </Link>
                                    <Link
                                        to="/services"
                                        className="group bg-white text-brand border-2 border-brand px-10 py-4 rounded-full font-semibold text-lg hover:bg-brand-light/10 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
                                    >
                                        {t('hero.cta_secondary')}
                                    </Link>
                                </div>


                            </div>
                        </div>

                        {/* Trust Indicators - Below CTAs, Centered */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-12 pb-8 text-sm font-medium text-text-secondary w-full">
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('hero.trust_1')}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('hero.trust_2')}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('hero.trust_3')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Service Highlights Section */}
                <section className="py-24 md:py-32 lg:py-40 bg-brand-light/30 relative">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                                {t('services.title')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
                            {/* Service 1 - Orthodontics */}
                            <div className="group bg-white rounded-xl border border-brand-light p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="h-16 w-16 rounded-2xl bg-brand-light flex items-center justify-center">
                                            <AdjustmentsHorizontalIcon className="h-8 w-8 text-brand" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-brand-dark mb-2">
                                            {t('services.ortho.title')}
                                        </h3>
                                        <p className="text-text-secondary leading-relaxed text-sm">
                                            {t('services.ortho.desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service 2 - Cosmetic */}
                            <div className="group bg-white rounded-xl border border-brand-light p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="h-16 w-16 rounded-2xl bg-brand-light flex items-center justify-center">
                                            <SparklesIcon className="h-8 w-8 text-brand" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-brand-dark mb-2">
                                            {t('services.cosmetic.title')}
                                        </h3>
                                        <p className="text-text-secondary leading-relaxed text-sm">
                                            {t('services.cosmetic.desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service 3 - General & Care */}
                            <div className="group bg-white rounded-xl border border-brand-light p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="h-16 w-16 rounded-2xl bg-brand-light flex items-center justify-center">
                                            <ShieldCheckIcon className="h-8 w-8 text-brand" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-brand-dark mb-2">
                                            {t('services.general.title')}
                                        </h3>
                                        <p className="text-text-secondary leading-relaxed text-sm">
                                            {t('services.general.desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service 4 - Replacement/Prosthetics */}
                            <div className="group bg-white rounded-xl border border-brand-light p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="h-16 w-16 rounded-2xl bg-brand-light flex items-center justify-center">
                                            <HeartIcon className="h-8 w-8 text-brand" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-brand-dark mb-2">
                                            {t('services.care.title')}
                                        </h3>
                                        <p className="text-text-secondary leading-relaxed text-sm">
                                            {t('services.care.desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <Link to="/services" className="text-brand font-bold hover:text-brand-dark inline-flex items-center text-lg transition-all hover:gap-2">
                                {t('services.view_all')}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-24 md:py-32 lg:py-40 bg-gradient-to-b from-white via-brand-light/20 to-white relative overflow-hidden">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.15]"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                                {t('about.team.title')}
                            </h2>
                            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                                {t('about.team.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                            {/* Team Member 1 */}
                            <div className="group bg-white rounded-xl border border-brand-light p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="aspect-square rounded-lg bg-brand-light/50 mb-6 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserGroupIcon className="h-20 w-20 text-brand" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">
                                    {t('about.team.member1.name')}
                                </h3>
                                <p className="text-brand font-semibold text-sm mb-3">
                                    {t('about.team.member1.role')}
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {t('about.team.member1.bio')}
                                </p>
                            </div>

                            {/* Team Member 2 */}
                            <div className="group bg-white rounded-xl border border-brand-light p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="aspect-square rounded-lg bg-brand-light/50 mb-6 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserGroupIcon className="h-20 w-20 text-brand" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">
                                    {t('about.team.member2.name')}
                                </h3>
                                <p className="text-brand font-semibold text-sm mb-3">
                                    {t('about.team.member2.role')}
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {t('about.team.member2.bio')}
                                </p>
                            </div>

                            {/* Team Member 3 */}
                            <div className="group bg-white rounded-xl border border-brand-light p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="aspect-square rounded-lg bg-brand-light/50 mb-6 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserGroupIcon className="h-20 w-20 text-brand" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">
                                    {t('about.team.member3.name')}
                                </h3>
                                <p className="text-brand font-semibold text-sm mb-3">
                                    {t('about.team.member3.role')}
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {t('about.team.member3.bio')}
                                </p>
                            </div>

                            {/* Team Member 4 */}
                            <div className="group bg-white rounded-xl border border-brand-light p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="aspect-square rounded-lg bg-brand-light/50 mb-6 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserGroupIcon className="h-20 w-20 text-brand" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">
                                    {t('about.team.member4.name')}
                                </h3>
                                <p className="text-brand font-semibold text-sm mb-3">
                                    {t('about.team.member4.role')}
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {t('about.team.member4.bio')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing/Booking Section - "Mafia Offer" */}
                <section className="py-24 md:py-32 lg:py-40 bg-gradient-to-b from-white to-brand/20 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                                {t('pricing.title')}
                            </h2>
                            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                                {t('pricing.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                            {/* Card 1: Health Package (General) */}
                            <div className="group bg-white rounded-2xl border-2 border-brand-light p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-brand text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                        {t('pricing.health.badge')}
                                    </span>
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-xl font-bold text-brand-dark mb-4">
                                        {t('pricing.health.title')}
                                    </h3>
                                    <p className="text-text-secondary text-sm mb-6">
                                        {t('pricing.health.items')}
                                    </p>
                                    <div className="mb-6">
                                        <p className="text-sm text-brand font-semibold mb-2">
                                            {t('pricing.health.price')}
                                        </p>
                                        <p className="text-4xl font-bold text-brand-dark">
                                            ฿{t('pricing.health.priceAmount')}
                                        </p>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-6 italic">
                                        {t('pricing.health.bookingNote')}
                                    </p>
                                    <Link
                                        to="/booking"
                                        className="block w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                                    >
                                        จองเลย
                                    </Link>
                                </div>
                            </div>

                            {/* Card 2: Orthodontics Package - Best Seller */}
                            <div className="group bg-white rounded-2xl border-2 border-brand p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative ring-4 ring-brand/20">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-brand to-brand-dark text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                                        ⭐ {t('pricing.orthodontics.badge')}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                        {t('pricing.orthodontics.subtitle')}
                                    </span>
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-xl font-bold text-brand-dark mb-4">
                                        {t('pricing.orthodontics.title')}
                                    </h3>
                                    <p className="text-text-secondary text-sm mb-4">
                                        {t('pricing.orthodontics.items')}
                                    </p>
                                    <div className="mb-4">
                                        <p className="text-sm text-brand font-semibold mb-2">
                                            {t('pricing.orthodontics.price')}
                                        </p>
                                        <p className="text-4xl font-bold text-brand-dark">
                                            ฿{t('pricing.orthodontics.priceAmount')}
                                        </p>
                                    </div>
                                    <div className="bg-brand-light/50 rounded-lg p-3 mb-4">
                                        <p className="text-xs text-brand-dark font-semibold">
                                            {t('pricing.orthodontics.includes')}
                                        </p>
                                    </div>
                                    <p className="text-xs text-brand font-semibold mb-4">
                                        {t('pricing.orthodontics.installment')}
                                    </p>
                                    <p className="text-xs text-text-secondary mb-6 italic">
                                        {t('pricing.orthodontics.bookingNote')}
                                    </p>
                                    <Link
                                        to="/booking"
                                        className="block w-full bg-gradient-to-r from-brand to-brand-dark text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                    >
                                        จองปรึกษาเลย
                                    </Link>
                                </div>
                            </div>

                            {/* Card 3: Whitening Package */}
                            <div className="group bg-white rounded-2xl border-2 border-brand-light p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-brand text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                                        ✨ {t('pricing.whitening.badge')}
                                    </span>
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-xl font-bold text-brand-dark mb-4">
                                        {t('pricing.whitening.title')}
                                    </h3>
                                    <p className="text-text-secondary text-sm mb-6">
                                        {t('pricing.whitening.items')}
                                    </p>
                                    <div className="mb-4">
                                        <p className="text-sm text-brand font-semibold mb-2">
                                            {t('pricing.whitening.price')}
                                        </p>
                                        <p className="text-text-secondary text-sm mb-2">
                                            {t('pricing.whitening.details')}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                                        <p className="text-sm text-red-600 font-bold">
                                            🎉 {t('pricing.whitening.discount')}
                                        </p>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-6 italic">
                                        {t('pricing.whitening.bookingNote')}
                                    </p>
                                    <Link
                                        to="/booking"
                                        className="block w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                                    >
                                        จองเลย
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reviews & Transformations Section */}
                <section className="pt-16 md:pt-20 pb-24 md:pb-32 lg:pb-40 bg-gradient-to-b from-brand/20 to-white relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                                {t('reviews.title')}
                            </h2>
                            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                                {t('reviews.subtitle')}
                            </p>
                        </div>

                        {/* Before/After Slider Placeholder */}
                        <div className="mb-16">
                            <div className="bg-white rounded-2xl border-2 border-brand-light p-8 shadow-lg max-w-4xl mx-auto">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-brand-dark mb-2">
                                        {t('reviews.beforeAfter')}
                                    </h3>
                                    <p className="text-text-secondary text-sm">
                                        ผลงานการรักษาจริงจากคนไข้ของเรา
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Before */}
                                    <div className="text-center">
                                        <div className="aspect-square bg-brand-light/50 rounded-xl mb-4 flex items-center justify-center">
                                            <div className="text-center">
                                                <SparklesIcon className="h-20 w-20 text-brand mx-auto mb-2" />
                                                <p className="text-brand font-semibold">ก่อนการรักษา</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* After */}
                                    <div className="text-center">
                                        <div className="aspect-square bg-brand-light/50 rounded-xl mb-4 flex items-center justify-center">
                                            <div className="text-center">
                                                <SparklesIcon className="h-20 w-20 text-brand mx-auto mb-2" />
                                                <p className="text-brand font-semibold">หลังการรักษา</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonials Grid */}
                        <div>
                            <h3 className="text-2xl font-bold text-brand-dark text-center mb-12">
                                {t('reviews.testimonials.title')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Review 1 */}
                                <div className="bg-white rounded-xl border border-brand-light p-6 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                                        "{t('reviews.testimonials.review1.text')}"
                                    </p>
                                    <div className="border-t border-brand-light pt-4">
                                        <p className="font-semibold text-brand-dark">
                                            {t('reviews.testimonials.review1.name')}
                                        </p>
                                        <p className="text-xs text-brand">
                                            {t('reviews.testimonials.review1.service')}
                                        </p>
                                    </div>
                                </div>

                                {/* Review 2 */}
                                <div className="bg-white rounded-xl border border-brand-light p-6 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                                        "{t('reviews.testimonials.review2.text')}"
                                    </p>
                                    <div className="border-t border-brand-light pt-4">
                                        <p className="font-semibold text-brand-dark">
                                            {t('reviews.testimonials.review2.name')}
                                        </p>
                                        <p className="text-xs text-brand">
                                            {t('reviews.testimonials.review2.service')}
                                        </p>
                                    </div>
                                </div>

                                {/* Review 3 */}
                                <div className="bg-white rounded-xl border border-brand-light p-6 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                                        "{t('reviews.testimonials.review3.text')}"
                                    </p>
                                    <div className="border-t border-brand-light pt-4">
                                        <p className="font-semibold text-brand-dark">
                                            {t('reviews.testimonials.review3.name')}
                                        </p>
                                        <p className="text-xs text-brand">
                                            {t('reviews.testimonials.review3.service')}
                                        </p>
                                    </div>
                                </div>

                                {/* Review 4 */}
                                <div className="bg-white rounded-xl border border-brand-light p-6 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                                        "{t('reviews.testimonials.review4.text')}"
                                    </p>
                                    <div className="border-t border-brand-light pt-4">
                                        <p className="font-semibold text-brand-dark">
                                            {t('reviews.testimonials.review4.name')}
                                        </p>
                                        <p className="text-xs text-brand">
                                            {t('reviews.testimonials.review4.service')}
                                        </p>
                                    </div>
                                </div>

                                {/* Review 5 */}
                                <div className="bg-white rounded-xl border border-brand-light p-6 shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                                        "{t('reviews.testimonials.review5.text')}"
                                    </p>
                                    <div className="border-t border-brand-light pt-4">
                                        <p className="font-semibold text-brand-dark">
                                            {t('reviews.testimonials.review5.name')}
                                        </p>
                                        <p className="text-xs text-brand">
                                            {t('reviews.testimonials.review5.service')}
                                        </p>
                                    </div>
                                </div>

                                {/* Placeholder for 6th review or CTA */}
                                <div className="bg-gradient-to-br from-brand to-brand-dark rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <SparklesIcon className="h-12 w-12 mx-auto mb-4" />
                                        <h4 className="text-xl font-bold mb-2">เป็นคนถัดไป?</h4>
                                        <p className="text-sm mb-6">แชร์ประสบการณ์ของคุณกับเรา</p>
                                        <Link
                                            to="/booking"
                                            className="inline-block bg-white text-brand px-6 py-2 rounded-full font-semibold hover:bg-brand-light transition-colors"
                                        >
                                            จองคิวเลย
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
