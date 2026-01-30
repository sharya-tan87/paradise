import React, { useState } from 'react';
import {
    FileText, Download, Calendar, FileSpreadsheet, File,
    Loader2, BarChart3, DollarSign, TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const REPORT_DEFINITIONS = [
    { id: 'p-and-l', icon: DollarSign },
    { id: 'daily-collections', icon: Calendar },
    { id: 'monthly-summary', icon: TrendingUp }
];

const ReportsPage = () => {
    const { t } = useTranslation();
    const [selectedReport, setSelectedReport] = useState('p-and-l');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [format, setFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.accessToken;

            const response = await fetch(
                `${API_URL}/reports/${selectedReport}?startDate=${startDate}&endDate=${endDate}&format=${format}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedReport}_${startDate}_${endDate}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedReportName = t(`reportsPage.types.${selectedReport}.name`);

    return (
        <DashboardLayout title={t('reportsPage.title')}>
            <div className="flex flex-col h-full">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
                        <FileText className="text-teal-600" />
                        {t('reportsPage.title')}
                    </h1>
                    <p className="text-gray-500 mt-1">{t('reportsPage.subtitle')}</p>
                </div>

                <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-6 space-y-6">
                    {/* Report Type Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">{t('reportsPage.selectType')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {REPORT_DEFINITIONS.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedReport === report.id
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${selectedReport === report.id ? 'bg-teal-100' : 'bg-gray-100'
                                            }`}>
                                            <report.icon className={`h-5 w-5 ${selectedReport === report.id ? 'text-teal-600' : 'text-gray-500'
                                                }`} />
                                        </div>
                                        <span className={`font-semibold ${selectedReport === report.id ? 'text-teal-700' : 'text-gray-900'
                                            }`}>
                                            {t(`reportsPage.types.${report.id}.name`)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{t(`reportsPage.types.${report.id}.desc`)}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('reportsPage.startDate')}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('reportsPage.endDate')}</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">{t('reportsPage.exportFormat')}</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${format === 'pdf' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="format"
                                    value="pdf"
                                    checked={format === 'pdf'}
                                    onChange={(e) => setFormat(e.target.value)}
                                    className="w-4 h-4 text-teal-600"
                                />
                                <File className={`h-5 w-5 ${format === 'pdf' ? 'text-teal-600' : 'text-gray-500'}`} />
                                <span className={`font-medium ${format === 'pdf' ? 'text-teal-700' : 'text-gray-700'}`}>PDF</span>
                            </label>
                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${format === 'csv' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="format"
                                    value="csv"
                                    checked={format === 'csv'}
                                    onChange={(e) => setFormat(e.target.value)}
                                    className="w-4 h-4 text-teal-600"
                                />
                                <FileSpreadsheet className={`h-5 w-5 ${format === 'csv' ? 'text-teal-600' : 'text-gray-500'}`} />
                                <span className={`font-medium ${format === 'csv' ? 'text-teal-700' : 'text-gray-700'}`}>CSV</span>
                            </label>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-md flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {t('reportsPage.generating')}
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    {t('reportsPage.generate')}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Report Preview Info */}
                <div className="mt-8 bg-primary-50 rounded-xl p-6 border border-primary-100">
                    <h3 className="font-semibold text-primary-900 mb-2">{t('reportsPage.about')} {selectedReportName}</h3>
                    <p className="text-gray-600 text-sm">
                        {t(`reportsPage.descriptions.${selectedReport}`)}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;
