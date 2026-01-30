import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    StarIcon,
    HeartIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    SparklesIcon,
    BeakerIcon,
    CalendarIcon
} from '@heroicons/react/24/outline'; // Ensure icons are imported
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    const { t } = useTranslation();

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

                            {/* Left Column: Image */}
                            <div className="relative flex justify-center lg:justify-start lg:h-[700px] items-center">
                                <img
                                    src="/img/paradise_aboutus.svg"
                                    alt="About Paradise Dental"
                                    className="w-full max-w-lg lg:max-w-xl h-auto drop-shadow-2xl animate-float relative z-10 hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </div>

                            {/* Right Column: Content */}
                            <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.35] text-primary-900">
                                    {t('about.hero.title_part1')} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">{t('about.hero.title_part2')}</span>
                                </h1>

                                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                                    {t('about.hero.description')}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                                    <a
                                        href="#standard"
                                        className="group relative bg-brand text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="relative z-10">{t('about.hero.cta_primary')}</span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </a>
                                    <a
                                        href="#team"
                                        className="group bg-white text-brand border-2 border-brand px-10 py-4 rounded-full font-semibold text-lg hover:bg-brand-light/10 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
                                    >
                                        {t('about.hero.cta_secondary')}
                                    </a>
                                </div>


                            </div>
                        </div>

                        {/* Trust Indicators - Replaced from Home Page Layout */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-12 pb-8 text-sm font-medium text-text-secondary w-full">
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('about.hero.trust_1')}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('about.hero.trust_2')}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <CheckCircleIcon className="h-5 w-5 text-brand" />
                                <span>{t('about.hero.trust_3')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="py-24 md:py-32 lg:py-40 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(206,224,243,0.15)_0%,transparent_70%)]"></div>

                    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-6">
                                วิสัยทัศน์
                            </h2>
                            <div className="w-20 h-1.5 bg-brand mx-auto rounded-full mb-8"></div>
                        </div>

                        {/* Vision Content */}
                        <div className="space-y-12">
                            {/* Main Vision Statement */}
                            <div className="text-center">
                                <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-6 leading-tight">
                                    มากกว่าคลินิกทันตกรรม... คือพื้นที่แห่งความสบายใจ
                                </h3>
                                <p className="text-xl md:text-2xl text-brand mb-8 font-semibold leading-relaxed">
                                    ยินดีต้อนรับสู่ Paradise Dental Clinic ที่ที่รอยยิ้มของคุณ คือการกิจของเรา
                                </p>
                            </div>

                            {/* Vision Description */}
                            <div className="bg-white rounded-2xl border border-brand-light shadow-lg p-8 md:p-12">
                                <div className="prose prose-lg max-w-none text-center">
                                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                                        "เราเข้าใจดีว่าหลายคน 'กลัว' การมาหาหมอฟัน... Paradise Dental Clinic จึงเกิดขึ้นจากความตั้งใจที่อยากสบายภาพความน่ากลัวเหล่านั้นออกไป เราเนรมิตบรรยากาศคลินิกให้สะอาดสบายตา ผ่อนคลายเหมือนค่าเพ้ เพื่อให้คุณและครอบครัวรู้สึก 'อุ่นใจ' ตั้งแต่ก้าวแรกที่เดินเข้ามา พร้อมการดูแลที่ใส่ใจในทุกรายละเอียด เหมือนคนในครอบครัวดูแลกันเอง"
                                    </p>
                                </div>
                            </div>

                            {/* Vision Pillars - Interior Design Focus */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                                {/* Pillar 1 */}
                                <div className="text-center">
                                    <div className="bg-brand-light rounded-xl p-6 mb-4 hover:bg-brand/10 transition-colors">
                                        <p className="text-base text-primary-900 leading-relaxed">
                                            คลินิกทันตกรรมพาราไดซ์ พันธกิจของเราคือการให้บริการทันตกรรมที่เป็นเลิศในระดับสากล เรากันเอง และระเอียวรอยยิ่มที่สุขภาพดีคือประสุดธิชีวิตคุณภาพชีวิตที่มีคุณภาพ
                                        </p>
                                    </div>
                                </div>

                                {/* Pillar 2 */}
                                <div className="text-center">
                                    <div className="bg-brand-light rounded-xl p-6 mb-4 hover:bg-brand/10 transition-colors">
                                        <p className="text-base text-primary-900 leading-relaxed">
                                            เรามุ่งมั่นที่จะเป็นผู้นำด้านนวัตกรรมทันตกรรม พร้อมทั้งรักษาความใส่ใจในแนวส่วนตัวที่ทำให้คนไข้ของเรารู้สึกเหมือนครอบครัว
                                        </p>
                                    </div>
                                </div>

                                {/* Pillar 3 */}
                                <div className="text-center">
                                    <div className="bg-brand-light rounded-xl p-6 mb-4 hover:bg-brand/10 transition-colors">
                                        <p className="text-base text-primary-900 leading-relaxed">
                                            เราให้บริการดูแลสุขภาพในการกำกับงานไปทั้งและทาน อังกฤษ และพยายามให้ทุกคนเข้าถึงบริการทันตกรรมที่มีคุณภาพและสะดวกสบาย
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section id="team" className="py-24 md:py-32 lg:py-40 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                                {t('about.team.title')}
                            </h2>
                            <p className="text-lg text-text-secondary">
                                {t('about.team.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
                            {/* Team Members */}
                            {[1, 2, 3, 4].map((id) => (
                                <div key={id} className="bg-white rounded-xl border border-primary-100 shadow-soft p-6 text-center hover:shadow-lg transition-all duration-300">
                                    <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-900 border-4 border-white shadow-sm">
                                        {['SP', 'EC', 'KS', 'DT'][id - 1]}
                                    </div>
                                    <h3 className="text-xl font-semibold text-primary-900 font-prompt mb-1">
                                        {t(`about.team.member${id}.name`)}
                                    </h3>
                                    <p className="text-brand-DEFAULT font-medium font-prompt mb-4 text-sm uppercase tracking-wide">
                                        {t(`about.team.member${id}.role`)}
                                    </p>
                                    <p className="text-text-secondary font-prompt text-sm leading-relaxed">
                                        {t(`about.team.member${id}.bio`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Standard Section */}
                <section id="standard" className="py-24 md:py-32 lg:py-40 bg-gradient-to-b from-white to-brand-light/20">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-4">
                                มาตรฐานของเรา
                            </h2>
                            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                                หลักการใช้บริการดูแลของเราในทุกๆ วัน
                            </p>
                        </div>

                        {/* Standards Cards - 3 Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-16">
                            {/* Standard 1: Sterilization */}
                            <div className="bg-white rounded-2xl border border-brand-light shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="flex justify-center mb-6">
                                    <div className="h-20 w-20 rounded-full bg-brand-light/50 flex items-center justify-center">
                                        <ShieldCheckIcon className="h-10 w-10 text-brand" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-4 text-center">
                                    🛡️ Sterilization
                                </h3>
                                <p className="text-text-secondary text-center leading-relaxed">
                                    ระบบฆ่าเชื้อมาตรฐานโรงพยาบาล สะอาด ปลอดภัย 100%
                                </p>
                            </div>

                            {/* Standard 2: Technology */}
                            <div className="bg-white rounded-2xl border border-brand-light shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="flex justify-center mb-6">
                                    <div className="h-20 w-20 rounded-full bg-brand-light/50 flex items-center justify-center">
                                        <BeakerIcon className="h-10 w-10 text-brand" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-4 text-center">
                                    🔬 Technology
                                </h3>
                                <p className="text-text-secondary text-center leading-relaxed">
                                    เครื่องมือทันสมัย เอกซเรย์ดิจิทัล ช่วยให้วางแผนรักษาแม่นยำ
                                </p>
                            </div>

                            {/* Standard 3: Service */}
                            <div className="bg-white rounded-2xl border border-brand-light shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="flex justify-center mb-6">
                                    <div className="h-20 w-20 rounded-full bg-brand-light/50 flex items-center justify-center">
                                        <HeartIcon className="h-10 w-10 text-brand" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-4 text-center">
                                    🤝 Service
                                </h3>
                                <p className="text-text-secondary text-center leading-relaxed">
                                    ให้คำปรึกษาตรงไปตรงมา ไม่เลี่ยงใช้ แจ้งค่าใช้จ่ายชัดเจนก่อนทำ
                                </p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="bg-gradient-to-r from-brand to-brand-dark rounded-2xl p-10 md:p-12 text-center shadow-2xl">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                พร้อมหรือยังที่จะเปลี่ยนความกลัว เป็นความมั่นใจ?
                            </h3>
                            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                                จองคิวตรวจฟันกับเรา เริ่มต้นเส้นทางสู่รอยยิ้มที่สดใสและมั่นใจ
                            </p>
                            <Link
                                to="/booking"
                                className="inline-flex items-center gap-3 bg-white text-brand px-10 py-4 rounded-full font-semibold text-lg hover:bg-brand-light transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <CalendarIcon className="h-6 w-6" />
                                <span>จองคิวปรึกษาคุหมอ</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
