import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Calendar, Clock, User, Phone, Stethoscope,
    ChevronLeft, ChevronRight, Eye, Activity,
    CalendarDays, Filter, Loader2, CheckCircle2,
    AlertCircle, XCircle, Clock3, CalendarCheck
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import DashboardLayout from '../components/DashboardLayout';
import { getCalendarAppointments } from '../services/api';

const DentistAppointmentsPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'calendar'
    const calendarRef = React.useRef(null);

    // Get user on mount
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
        } else {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
            } catch (e) {
                console.error('Failed to parse user', e);
                navigate('/login');
            }
        }
    }, [navigate]);

    // Fetch appointments
    useEffect(() => {
        if (!user) return;
        if (viewMode === 'calendar') return;
        fetchAppointments();
    }, [user, selectedDate, viewMode]);

    const fetchAppointments = async (customRange) => {
        setLoading(true);
        try {
            let start, end;

            if (customRange) {
                start = customRange.start;
                end = customRange.end;
            } else if (viewMode === 'day') {
                start = new Date(selectedDate);
                start.setHours(0, 0, 0, 0);
                end = new Date(selectedDate);
                end.setHours(23, 59, 59, 999);
            } else {
                // Week view - get Sunday to Saturday
                const day = selectedDate.getDay();
                start = new Date(selectedDate);
                start.setDate(start.getDate() - day);
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
            }

            const params = {
                start: start.toISOString(),
                end: end.toISOString(),
                dentistId: user.id // Only fetch dentist's own appointments
            };

            const response = await getCalendarAppointments(params);
            if (response?.success) {
                // Sort by date and time
                const sorted = (response.data || []).sort((a, b) => {
                    const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
                    if (dateCompare !== 0) return dateCompare;
                    return a.startTime.localeCompare(b.startTime);
                });
                setAppointments(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    // Date navigation
    const goToday = () => setSelectedDate(new Date());

    const goPrevious = () => {
        const newDate = new Date(selectedDate);
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 7);
        }
        setSelectedDate(newDate);
    };

    const goNext = () => {
        const newDate = new Date(selectedDate);
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setSelectedDate(newDate);
    };

    // Format date
    const formatDate = (date) => {
        const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatWeekRange = () => {
        const day = selectedDate.getDay();
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - day);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}, ${end.getFullYear()}`;
    };

    // Status styling
    const getStatusInfo = (status) => {
        const statusMap = {
            'scheduled': {
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: Clock3,
                label: t('dentistAppointments.status.scheduled') || 'Scheduled'
            },
            'confirmed': {
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: CheckCircle2,
                label: t('dentistAppointments.status.confirmed') || 'Confirmed'
            },
            'in-progress': {
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Activity,
                label: t('dentistAppointments.status.inProgress') || 'In Progress'
            },
            'completed': {
                color: 'bg-slate-50 text-slate-600 border-slate-200',
                icon: CheckCircle2,
                label: t('dentistAppointments.status.completed') || 'Completed'
            },
            'cancelled': {
                color: 'bg-red-50 text-red-600 border-red-200',
                icon: XCircle,
                label: t('dentistAppointments.status.cancelled') || 'Cancelled'
            },
            'no-show': {
                color: 'bg-gray-50 text-gray-600 border-gray-200',
                icon: AlertCircle,
                label: t('dentistAppointments.status.noShow') || 'No Show'
            }
        };
        return statusMap[status] || statusMap['scheduled'];
    };

    // Group appointments by date (for week view)
    const groupByDate = (appointments) => {
        const grouped = {};
        appointments.forEach(app => {
            if (!grouped[app.appointmentDate]) {
                grouped[app.appointmentDate] = [];
            }
            grouped[app.appointmentDate].push(app);
        });
        return grouped;
    };

    // Format time for display
    const formatTime = (time) => {
        if (!time) return '';
        return time.substring(0, 5);
    };

    // Handle start treatment
    const handleStartTreatment = (appointment) => {
        const patientName = appointment.patient
            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
            : '';
        navigate('/dashboard/treatments', { state: { searchTerm: patientName } });
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    const groupedAppointments = viewMode === 'week' ? groupByDate(appointments) : null;

    return (
        <DashboardLayout title={t('dentistAppointments.title') || 'My Appointments'}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="bg-teal-100 p-2.5 rounded-xl">
                                <CalendarDays className="w-6 h-6 text-teal-600" />
                            </div>
                            {t('dentistAppointments.header') || 'My Appointments'}
                        </h1>
                        <p className="text-slate-500 mt-1 ml-12">
                            {t('dentistAppointments.subtitle') || 'View and manage your scheduled appointments'}
                        </p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-xl p-1 border border-slate-200 shadow-sm flex">
                            <button
                                onClick={() => setViewMode('day')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'day'
                                    ? 'bg-teal-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {t('dentistAppointments.viewDay') || 'Day'}
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'week'
                                    ? 'bg-teal-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {t('dentistAppointments.viewWeek') || 'Week'}
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'calendar'
                                    ? 'bg-teal-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <CalendarCheck size={16} />
                                {t('dentistAppointments.viewCalendar') || 'Calendar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Date Navigation - Only show if NOT in calendar mode */}
                {viewMode !== 'calendar' && (
                    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={goPrevious}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={goToday}
                                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium rounded-lg transition-colors text-sm"
                            >
                                {t('dentistAppointments.today') || 'Today'}
                            </button>
                            <button
                                onClick={goNext}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-teal-600" />
                            <span className="text-lg font-semibold text-slate-800">
                                {viewMode === 'day' ? formatDate(selectedDate) : formatWeekRange()}
                            </span>
                        </div>

                        <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-600 text-sm font-medium">
                                {t('dentistAppointments.totalAppointments') || 'Total'}:
                                <span className="text-teal-600 font-bold ml-1">{appointments.length}</span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading && viewMode !== 'calendar' ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                </div>
            ) : (appointments.length === 0 && viewMode !== 'calendar') ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        {t('dentistAppointments.noAppointments') || 'No appointments'}
                    </h3>
                    <p className="text-slate-500">
                        {viewMode === 'day'
                            ? (t('dentistAppointments.noAppointmentsDay') || 'You have no appointments for this day.')
                            : (t('dentistAppointments.noAppointmentsWeek') || 'You have no appointments for this week.')
                        }
                    </p>
                </div>
            ) : viewMode === 'day' ? (
                /* Day View - Card List */
                <div className="space-y-4">
                    {appointments.map((appointment) => {
                        const statusInfo = getStatusInfo(appointment.status);
                        const StatusIcon = statusInfo.icon;
                        const patientName = appointment.patient
                            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                            : 'Unknown Patient';
                        const patientHN = appointment.patient?.hn || '-';
                        const patientPhone = appointment.patient?.phone || '-';

                        return (
                            <div
                                key={appointment.id}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row">
                                    {/* Time Block */}
                                    <div className="lg:w-40 bg-gradient-to-br from-teal-500 to-teal-600 p-5 flex flex-col items-center justify-center text-white">
                                        <Clock className="w-6 h-6 mb-2 opacity-80" />
                                        <span className="text-2xl font-bold">
                                            {formatTime(appointment.startTime)}
                                        </span>
                                        <span className="text-teal-100 text-sm">
                                            - {formatTime(appointment.endTime)}
                                        </span>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Patient Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="bg-slate-100 p-2 rounded-lg">
                                                        <User className="w-5 h-5 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800 text-lg">
                                                            {patientName}
                                                        </h3>
                                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                                            HN: {patientHN}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        <span>{patientPhone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Stethoscope className="w-4 h-4 text-slate-400" />
                                                        <span>{appointment.serviceType || '-'}</span>
                                                    </div>
                                                </div>

                                                {appointment.notes && (
                                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                        <p className="text-sm text-amber-700">
                                                            <strong>{t('dentistAppointments.notes') || 'Notes'}:</strong> {appointment.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status and Actions */}
                                            <div className="flex flex-col items-start lg:items-end gap-3">
                                                <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    <span className="font-medium text-sm">{statusInfo.label}</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {(appointment.status === 'confirmed' || appointment.status === 'in-progress') && (
                                                        <button
                                                            onClick={() => handleStartTreatment(appointment)}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <Activity className="w-4 h-4" />
                                                            {t('dentistAppointments.startTreatment') || 'Start Treatment'}
                                                        </button>
                                                    )}
                                                    <a
                                                        href={`tel:${patientPhone}`}
                                                        className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-green-200"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                        {t('dentistAppointments.call') || 'Call'}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : viewMode === 'calendar' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <style>{`
                        .fc { font-family: inherit; }
                        .fc-theme-standard td, .fc-theme-standard th { border-color: #E5E7EB; }
                        .fc-col-header-cell { background-color: #F9FAFB; padding: 10px 0; }
                        .fc-timegrid-slot { height: 3rem; }
                        
                        .fc-header-toolbar { margin-bottom: 1.5rem !important; }
                        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 600 !important; color: #111827; }
                        
                        .fc-button-primary { 
                            background-color: #0D9488 !important; 
                            border-color: #0D9488 !important; 
                            font-weight: 500 !important;
                            padding: 0.5rem 1rem !important;
                            border-radius: 0.5rem !important;
                        }
                        .fc-button-primary:hover { 
                            background-color: #0F766E !important; 
                            border-color: #0F766E !important;
                        }
                        .fc-button-active { 
                            background-color: #0F766E !important; 
                            border-color: #0F766E !important; 
                        }
                        
                        .fc-event { 
                            border-radius: 4px; 
                            border: none; 
                            padding: 2px 4px; 
                            font-size: 0.85rem; 
                            cursor: pointer;
                        }
                        .fc-event:hover { filter: brightness(1.1); }
                        
                        .fc-day-today { background-color: #F0FDFA !important; }
                    `}</style>

                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        buttonText={{
                            today: t('dentistAppointments.today') || 'Today',
                            month: t('dentistAppointments.viewMonth') || 'Month',
                            week: t('dentistAppointments.viewWeek') || 'Week',
                            day: t('dentistAppointments.viewDay') || 'Day'
                        }}
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        height="auto"
                        datesSet={(range) => fetchAppointments({ start: range.start, end: range.end })}
                        events={appointments.map(app => {
                            const statusInfo = getStatusInfo(app.status);
                            const patientName = app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Unknown';

                            return {
                                id: app.id,
                                title: `${formatTime(app.startTime)} ${patientName}`,
                                start: `${app.appointmentDate}T${app.startTime}`,
                                end: `${app.appointmentDate}T${app.endTime}`,
                                backgroundColor: statusInfo.color.includes('bg-') ? '' : '#2D7C9C', // Fallback
                                className: statusInfo.color.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-')).join(' '),
                                extendedProps: { ...app }
                            };
                        })}
                        eventContent={(eventInfo) => {
                            // Custom event rendering to use Tailwind classes properly
                            const app = eventInfo.event.extendedProps;
                            const statusInfo = getStatusInfo(app.status);
                            return (
                                <div className={`w-full h-full px-1 overflow-hidden text-xs rounded ${statusInfo.color}`}>
                                    <div className="font-semibold">{eventInfo.event.title}</div>
                                </div>
                            );
                        }}
                        eventClick={(info) => {
                            // Can show details or start treatment
                            // For now, simpler handling or same as list view?
                        }}
                        locale={i18n.language}
                        nowIndicator={true}
                    />
                </div>
            ) : (
                /* Week View - Grouped by Date */
                <div className="space-y-6">
                    {Object.entries(groupedAppointments).map(([date, dayAppointments]) => {
                        const dateObj = new Date(date + 'T00:00:00');
                        const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
                        const isToday = new Date().toDateString() === dateObj.toDateString();

                        return (
                            <div key={date}>
                                {/* Date Header */}
                                <div className={`flex items-center gap-3 mb-3 px-4 py-3 rounded-xl ${isToday ? 'bg-teal-50 border border-teal-200' : 'bg-slate-50 border border-slate-100'
                                    }`}>
                                    <CalendarDays className={`w-5 h-5 ${isToday ? 'text-teal-600' : 'text-slate-500'}`} />
                                    <span className={`font-semibold ${isToday ? 'text-teal-800' : 'text-slate-700'}`}>
                                        {dateObj.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </span>
                                    {isToday && (
                                        <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                            {t('dentistAppointments.today') || 'Today'}
                                        </span>
                                    )}
                                    <span className="ml-auto text-sm text-slate-500">
                                        {dayAppointments.length} {t('dentistAppointments.appointments') || 'appointments'}
                                    </span>
                                </div>

                                {/* Appointments for this day */}
                                <div className="space-y-3 pl-4">
                                    {dayAppointments.map((appointment) => {
                                        const statusInfo = getStatusInfo(appointment.status);
                                        const StatusIcon = statusInfo.icon;
                                        const patientName = appointment.patient
                                            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                                            : 'Unknown Patient';

                                        return (
                                            <div
                                                key={appointment.id}
                                                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                                            >
                                                {/* Time */}
                                                <div className="flex items-center gap-2 sm:w-32">
                                                    <div className="bg-teal-50 p-2 rounded-lg">
                                                        <Clock className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700">
                                                        {formatTime(appointment.startTime)}
                                                    </span>
                                                </div>

                                                {/* Patient */}
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800">{patientName}</p>
                                                    <p className="text-sm text-slate-500">{appointment.serviceType || '-'}</p>
                                                </div>

                                                {/* Status */}
                                                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-medium ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {statusInfo.label}
                                                </div>

                                                {/* Actions */}
                                                {(appointment.status === 'confirmed' || appointment.status === 'in-progress') && (
                                                    <button
                                                        onClick={() => handleStartTreatment(appointment)}
                                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-indigo-200"
                                                    >
                                                        <Activity className="w-4 h-4" />
                                                        {t('dentistAppointments.treat') || 'Treat'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
            }
        </DashboardLayout >
    );
};

export default DentistAppointmentsPage;
