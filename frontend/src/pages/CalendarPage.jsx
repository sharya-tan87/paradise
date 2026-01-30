import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Filter, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AppointmentFormModal from '../components/AppointmentFormModal';
import { getCalendarAppointments, createAppointment, updateAppointment, deleteAppointment, getDentists } from '../services/api';

const CalendarPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [user, setUser] = useState(null);

    // Filters
    const [dentists, setDentists] = useState([]);
    const [selectedDentist, setSelectedDentist] = useState('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // Current View Range
    const [currentRange, setCurrentRange] = useState({ start: null, end: null });

    // Verify Auth
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
        } else {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Failed to parse user', e);
            }
            setIsReady(true);
        }
    }, [navigate]);

    // Load Dentists
    useEffect(() => {
        if (!isReady) return;

        const fetchDentists = async () => {
            try {
                const response = await getDentists();
                if (response && response.success) {
                    setDentists(response.data || []);
                }
            } catch (error) {
                console.error('Failed to load dentists', error);
            }
        };
        fetchDentists();
    }, [isReady]);

    // Fetch Events
    const fetchEvents = async (start, end) => {
        if (!start || !end) return;

        setLoading(true);
        try {
            const params = {
                start: start.toISOString(),
                end: end.toISOString()
            };
            if (selectedDentist) params.dentistId = selectedDentist;

            const response = await getCalendarAppointments(params);
            if (response && response.success) {
                const formattedEvents = (response.data || []).map(app => {
                    const patientName = app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Unknown';
                    const dentistName = app.dentist ? app.dentist.username : '';
                    const serviceType = app.serviceType || '';

                    // Format: "Patient Name - Service (Dr.Name)"
                    let eventTitle = patientName;
                    if (serviceType) eventTitle += ` - ${serviceType}`;
                    if (dentistName) eventTitle += ` (${dentistName})`;

                    return {
                        id: app.id,
                        title: eventTitle,
                        start: `${app.appointmentDate}T${app.startTime}`,
                        end: `${app.appointmentDate}T${app.endTime}`,
                        backgroundColor: getStatusColor(app.status),
                        borderColor: getStatusColor(app.status),
                        textColor: '#ffffff',
                        extendedProps: { ...app }
                    };
                });
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'scheduled': '#2D7C9C',
            'confirmed': '#10B981',
            'in-progress': '#F59E0B',
            'completed': '#6B7280',
            'cancelled': '#EF4444',
            'no-show': '#374151'
        };
        return colors[status] || '#2D7C9C';
    };

    const handleDatesSet = (dateInfo) => {
        setCurrentRange({ start: dateInfo.start, end: dateInfo.end });
        fetchEvents(dateInfo.start, dateInfo.end);
    };

    // Refetch when filter changes
    useEffect(() => {
        if (currentRange.start && currentRange.end) {
            fetchEvents(currentRange.start, currentRange.end);
        }
    }, [selectedDentist]);

    const handleDateClick = (arg) => {
        const date = arg.dateStr.split('T')[0];
        let time = '09:00';
        if (arg.dateStr.includes('T')) {
            time = arg.dateStr.split('T')[1].substring(0, 5);
        }

        let endTime = '09:30';
        if (time) {
            const [h, m] = time.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(h, m + 30);
            endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        }

        setModalData({
            appointmentDate: date,
            startTime: time,
            endTime: endTime,
            status: 'scheduled'
        });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleEventClick = (info) => {
        const app = info.event.extendedProps;

        // Restriction: Dentists cannot manage other dentists' appointments
        if (user?.role === 'dentist' && app.dentistId && app.dentistId !== user.id) {
            alert(t('calendarPage.errors.cannotManageOtherDentist') || "You can only manage your own appointments.");
            return;
        }

        setModalData({
            ...app,
            appointmentDate: app.appointmentDate,
            startTime: app.startTime ? app.startTime.substring(0, 5) : '09:00',
            endTime: app.endTime ? app.endTime.substring(0, 5) : '09:30'
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateAppointment(modalData.id, data);
            } else {
                await createAppointment(data);
            }
            setIsModalOpen(false);
            if (currentRange.start && currentRange.end) {
                fetchEvents(currentRange.start, currentRange.end);
            }
        } catch (error) {
            alert(error.message || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;
        try {
            await deleteAppointment(modalData.id);
            setIsModalOpen(false);
            if (currentRange.start && currentRange.end) {
                fetchEvents(currentRange.start, currentRange.end);
            }
        } catch (error) {
            alert(error.message || 'ลบนัดหมายไม่สำเร็จ');
        }
    };

    const handleNewAppointment = () => {
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:00`;

        const initialData = {
            appointmentDate: now.toISOString().split('T')[0],
            startTime: timeString,
            endTime: `${String(Math.min(now.getHours() + 1, 23)).padStart(2, '0')}:00`,
            status: 'scheduled'
        };

        if (user?.role === 'dentist') {
            initialData.dentistId = user.id;
        }

        setModalData(initialData);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    // Handle event drag (change time/date)
    const handleEventDrop = async (info) => {
        const { event, revert } = info;
        const app = event.extendedProps;

        // Restriction: Dentists cannot move other dentists' appointments
        if (user?.role === 'dentist' && app.dentistId && app.dentistId !== user.id) {
            alert(t('calendarPage.errors.cannotManageOtherDentist') || "You can only manage your own appointments.");
            revert();
            return;
        }

        try {
            const newStart = event.start;
            const newEnd = event.end;

            const appointmentDate = newStart.toISOString().split('T')[0];
            const startTime = newStart.toTimeString().substring(0, 5);
            const endTime = newEnd ? newEnd.toTimeString().substring(0, 5) : startTime;

            await updateAppointment(app.id, {
                appointmentDate,
                startTime,
                endTime
            });

            // Refresh events to ensure consistency
            if (currentRange.start && currentRange.end) {
                fetchEvents(currentRange.start, currentRange.end);
            }
        } catch (error) {
            console.error('Failed to update appointment', error);
            alert(error.message || 'Failed to update appointment');
            revert(); // Revert to original position on error
        }
    };

    // Handle event resize (change duration)
    const handleEventResize = async (info) => {
        const { event, revert } = info;
        const app = event.extendedProps;

        // Restriction: Dentists cannot resize other dentists' appointments
        if (user?.role === 'dentist' && app.dentistId && app.dentistId !== user.id) {
            alert(t('calendarPage.errors.cannotManageOtherDentist') || "You can only manage your own appointments.");
            revert();
            return;
        }

        try {
            const newStart = event.start;
            const newEnd = event.end;

            const startTime = newStart.toTimeString().substring(0, 5);
            const endTime = newEnd ? newEnd.toTimeString().substring(0, 5) : startTime;

            await updateAppointment(app.id, {
                startTime,
                endTime
            });

            // Refresh events to ensure consistency
            if (currentRange.start && currentRange.end) {
                fetchEvents(currentRange.start, currentRange.end);
            }
        } catch (error) {
            console.error('Failed to update appointment', error);
            alert(error.message || 'Failed to update appointment duration');
            revert(); // Revert to original size on error
        }
    };

    // Don't render until auth check is complete
    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout title={t('calendarPage.title')}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                            <CalendarIcon size={24} />
                        </div>
                        {t('calendarPage.header')}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-11">{t('calendarPage.subtitle')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedDentist}
                            onChange={(e) => setSelectedDentist(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none hover:border-teal-300 transition-all shadow-sm cursor-pointer"
                        >
                            <option value="">{t('calendarPage.filterDentist')}</option>
                            {dentists.map(d => (
                                <option key={d.id} value={d.id}>{d.username}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleNewAppointment}
                        className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Plus size={18} />
                        <span>{t('calendarPage.newAppointment')}</span>
                    </button>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative min-h-[600px]">
                {loading && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                    </div>
                )}

                <style>{`
                    .fc { font-family: inherit; }
                    .fc-theme-standard td, .fc-theme-standard th { border-color: #E5E7EB; }
                    .fc-col-header-cell { background-color: #F9FAFB; padding: 10px 0; }
                    .fc-timegrid-slot { height: 3rem; }
                    
                    .fc-header-toolbar { margin-bottom: 1.5rem !important; }
                    .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 600 !important; color: #111827; }
                    
                    .fc-button-primary { 
                        background-color: #2D7C9C !important; 
                        border-color: #2D7C9C !important; 
                        font-weight: 500 !important;
                        padding: 0.5rem 1rem !important;
                        border-radius: 0.5rem !important;
                    }
                    .fc-button-primary:hover { 
                        background-color: #1A5F7A !important; 
                        border-color: #1A5F7A !important;
                    }
                    .fc-button-active { 
                        background-color: #1A5F7A !important; 
                        border-color: #1A5F7A !important; 
                    }
                    
                    /* Event Styling with Drag & Drop */
                    .fc-event { 
                        border-radius: 6px; 
                        border: none; 
                        padding: 4px 6px; 
                        font-size: 0.85rem; 
                        cursor: grab;
                        transition: transform 0.15s ease, box-shadow 0.15s ease;
                    }
                    .fc-event:hover { 
                        filter: brightness(1.05);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        transform: scale(1.01);
                    }
                    .fc-event:active,
                    .fc-event.fc-event-dragging { 
                        cursor: grabbing;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
                        transform: scale(1.03);
                        z-index: 999 !important;
                    }
                    
                    /* Resize handle styling */
                    .fc-event-resizer {
                        opacity: 0;
                        transition: opacity 0.2s ease;
                    }
                    .fc-event:hover .fc-event-resizer {
                        opacity: 1;
                    }
                    .fc-event-resizer-end {
                        bottom: -2px;
                        height: 8px;
                        cursor: ns-resize;
                        background: linear-gradient(transparent, rgba(255,255,255,0.5));
                        border-radius: 0 0 6px 6px;
                    }
                    
                    /* Mirror event (ghost while dragging) */
                    .fc-event-mirror {
                        opacity: 0.7;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                    }
                    
                    .fc-day-today { background-color: #F0FDFA !important; }
                    
                    /* Highlight drop zones */
                    .fc-timegrid-slot:hover {
                        background-color: rgba(45, 124, 156, 0.05);
                    }
                `}</style>

                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    buttonText={{
                        today: 'วันนี้',
                        month: 'เดือน',
                        week: 'สัปดาห์',
                        day: 'วัน'
                    }}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    height="auto"
                    datesSet={handleDatesSet}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    events={events}
                    locale="th"
                    nowIndicator={true}
                    weekends={true}
                    // Drag and Drop settings
                    editable={true}
                    droppable={true}
                    eventDurationEditable={true}
                    eventStartEditable={true}
                    snapDuration="00:15:00"
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                />
            </div>

            <AppointmentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                onDelete={isEditMode ? handleDelete : undefined}
                initialData={modalData}
                isEditMode={isEditMode}
                userRole={user?.role}
                currentUserId={user?.id}
                isCreateMode={!isEditMode}
            />
        </DashboardLayout>
    );
};

export default CalendarPage;
