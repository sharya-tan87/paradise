import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    DollarSign, Users, Calendar, TrendingUp, RefreshCw, BarChart3, Loader2, FileText
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import { getDashboardAnalytics } from '../services/api';

// Brand Colors
const BRAND_COLORS = {
    lightBlue: '#CEE0F3',
    tealBlue: '#2D7C9C',
    deepNavy: '#214491',
    gray: '#9CA3AF'
};

const STATUS_COLORS = {
    scheduled: BRAND_COLORS.lightBlue,
    confirmed: BRAND_COLORS.lightBlue,
    completed: BRAND_COLORS.tealBlue,
    cancelled: BRAND_COLORS.deepNavy,
    'no-show': BRAND_COLORS.gray,
    'in-progress': BRAND_COLORS.tealBlue
};

// KPI Card Component
const KPICard = ({ title, value, icon: Icon, loading }) => (
    <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm">
        {loading ? (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-teal-50 p-2 rounded-lg">
                        <Icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">{title}</span>
                </div>
                <p className="text-3xl font-bold text-primary-900">{value}</p>
            </>
        )}
    </div>
);

// Skeleton for charts
const ChartSkeleton = () => (
    <div className="animate-pulse bg-gray-100 rounded-lg h-64 w-full"></div>
);

const AnalyticsDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('6months');
    const [data, setData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getDashboardAnalytics({ dateRange });
            setData(res);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const kpis = data?.kpis || {};
    const charts = data?.charts || {};

    return (
        <DashboardLayout title={t('executiveDashboard.title')}>
            <div className="flex flex-col h-full">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 flex items-center gap-3">
                            <BarChart3 className="text-teal-600" />
                            {t('executiveDashboard.title')}
                        </h1>
                        <p className="text-gray-500 mt-1">{t('executiveDashboard.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date Range Filter */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none bg-white"
                        >
                            <option value="thisMonth">{t('executiveDashboard.dateRange.thisMonth')}</option>
                            <option value="3months">{t('executiveDashboard.dateRange.last3Months')}</option>
                            <option value="6months">{t('executiveDashboard.dateRange.last6Months')}</option>
                            <option value="thisYear">{t('executiveDashboard.dateRange.thisYear')}</option>
                        </select>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-2.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <Link
                            to="/dashboard/reports"
                            className="px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                        >
                            <FileText size={18} />
                            {t('executiveDashboard.reports')}
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard
                        title={t('executiveDashboard.kpi.revenue')}
                        value={`฿${(kpis.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        icon={DollarSign}
                        loading={loading}
                    />
                    <KPICard
                        title={t('executiveDashboard.kpi.activePatients')}
                        value={(kpis.activePatients || 0).toLocaleString()}
                        icon={Users}
                        loading={loading}
                    />
                    <KPICard
                        title={t('executiveDashboard.kpi.appointments')}
                        value={(kpis.appointmentsThisMonth || 0).toLocaleString()}
                        icon={Calendar}
                        loading={loading}
                    />
                    <KPICard
                        title={t('executiveDashboard.kpi.fillRate')}
                        value={`${kpis.fillRate || 0}%`}
                        icon={TrendingUp}
                        loading={loading}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm">
                        <h3 className="text-lg font-bold text-primary-900 mb-4">{t('executiveDashboard.charts.monthlyRevenue')}</h3>
                        {loading ? (
                            <ChartSkeleton />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={charts.monthlyRevenue || []}>
                                    <XAxis
                                        dataKey="month"
                                        stroke={BRAND_COLORS.deepNavy}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={{ stroke: BRAND_COLORS.lightBlue }}
                                    />
                                    <YAxis
                                        stroke={BRAND_COLORS.deepNavy}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={{ stroke: BRAND_COLORS.lightBlue }}
                                        tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            border: `1px solid ${BRAND_COLORS.lightBlue}`,
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={BRAND_COLORS.tealBlue}
                                        strokeWidth={3}
                                        dot={{ fill: BRAND_COLORS.tealBlue, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Patient Growth Chart */}
                    <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm">
                        <h3 className="text-lg font-bold text-primary-900 mb-4">{t('executiveDashboard.charts.newPatients')}</h3>
                        {loading ? (
                            <ChartSkeleton />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={charts.patientGrowth || []}>
                                    <XAxis
                                        dataKey="month"
                                        stroke={BRAND_COLORS.deepNavy}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={{ stroke: BRAND_COLORS.lightBlue }}
                                    />
                                    <YAxis
                                        stroke={BRAND_COLORS.deepNavy}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={{ stroke: BRAND_COLORS.lightBlue }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            border: `1px solid ${BRAND_COLORS.lightBlue}`,
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value) => [value, 'New Patients']}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill={BRAND_COLORS.deepNavy}
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Appointment Status Chart */}
                    <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm lg:col-span-2">
                        <h3 className="text-lg font-bold text-primary-900 mb-4">{t('executiveDashboard.charts.appointmentStatus')}</h3>
                        {loading ? (
                            <ChartSkeleton />
                        ) : (
                            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                <ResponsiveContainer width="100%" height={280} className="max-w-md">
                                    <PieChart>
                                        <Pie
                                            data={charts.statusBreakdown || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="count"
                                            nameKey="status"
                                            label={({ status, percent }) =>
                                                `${status}: ${(percent * 100).toFixed(0)}%`
                                            }
                                            labelLine={false}
                                        >
                                            {(charts.statusBreakdown || []).map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={STATUS_COLORS[entry.status] || BRAND_COLORS.gray}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                border: `1px solid ${BRAND_COLORS.lightBlue}`,
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value, name) => [value, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Legend */}
                                <div className="flex flex-wrap justify-center gap-4">
                                    {(charts.statusBreakdown || []).map((item) => (
                                        <div key={item.status} className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: STATUS_COLORS[item.status] || BRAND_COLORS.gray }}
                                            ></div>
                                            <span className="text-sm text-gray-700 capitalize">
                                                {item.status}: <span className="font-semibold">{item.count}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsDashboard;
