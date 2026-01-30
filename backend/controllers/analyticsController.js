const { Invoice, Patient, Appointment } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../models');

// Helper: Get date range based on filter
const getDateRange = (dateRange) => {
    const now = new Date();
    const endDate = now;
    let startDate;

    switch (dateRange) {
        case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case '3months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            break;
        case '6months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            break;
        case 'thisYear':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    }

    return { startDate, endDate };
};

exports.getDashboardMetrics = async (req, res) => {
    try {
        const { dateRange = '6months' } = req.query;
        const { startDate, endDate } = getDateRange(dateRange);
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // KPI 1: Total Revenue (Current Month)
        const totalRevenue = await Invoice.sum('totalAmount', {
            where: {
                paymentStatus: 'paid',
                invoiceDate: { [Op.between]: [currentMonthStart, currentMonthEnd] }
            }
        }) || 0;

        // KPI 2: Active Patients
        const activePatients = await Patient.count({
            where: { active: true }
        });

        // KPI 3: Appointments This Month
        const appointmentsThisMonth = await Appointment.count({
            where: {
                appointmentDate: { [Op.between]: [currentMonthStart, currentMonthEnd] },
                active: true
            }
        });

        // KPI 4: Appointment Fill Rate
        const totalScheduled = await Appointment.count({
            where: {
                appointmentDate: { [Op.between]: [startDate, endDate] },
                status: { [Op.in]: ['scheduled', 'confirmed', 'completed', 'in-progress'] },
                active: true
            }
        });
        const completedAppointments = await Appointment.count({
            where: {
                appointmentDate: { [Op.between]: [startDate, endDate] },
                status: 'completed',
                active: true
            }
        });
        const fillRate = totalScheduled > 0 ? ((completedAppointments / totalScheduled) * 100).toFixed(1) : 0;

        // Chart 1: Monthly Revenue (Past 6 months)
        const monthlyRevenueRaw = await Invoice.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('invoiceDate'), '%Y-%m'), 'month'],
                [fn('SUM', col('totalAmount')), 'revenue']
            ],
            where: {
                paymentStatus: 'paid',
                invoiceDate: { [Op.gte]: startDate }
            },
            group: [fn('DATE_FORMAT', col('invoiceDate'), '%Y-%m')],
            order: [[fn('DATE_FORMAT', col('invoiceDate'), '%Y-%m'), 'ASC']],
            raw: true
        });

        // Format monthly revenue with month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = monthlyRevenueRaw.map(item => {
            const [year, month] = item.month.split('-');
            return {
                month: monthNames[parseInt(month) - 1] + ' ' + year.slice(2),
                revenue: parseFloat(item.revenue) || 0
            };
        });

        // Chart 2: Patient Growth (New patients per month)
        const patientGrowthRaw = await Patient.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: startDate }
            },
            group: [fn('DATE_FORMAT', col('created_at'), '%Y-%m')],
            order: [[fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'ASC']],
            raw: true
        });

        const patientGrowth = patientGrowthRaw.map(item => {
            const [year, month] = item.month.split('-');
            return {
                month: monthNames[parseInt(month) - 1] + ' ' + year.slice(2),
                count: parseInt(item.count) || 0
            };
        });

        // Chart 3: Appointment Status Breakdown
        const appointmentStatus = await Appointment.findAll({
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                appointmentDate: { [Op.between]: [startDate, endDate] },
                active: true
            },
            group: ['status'],
            raw: true
        });

        const statusBreakdown = appointmentStatus.map(item => ({
            status: item.status,
            count: parseInt(item.count) || 0
        }));

        res.json({
            kpis: {
                totalRevenue,
                activePatients,
                appointmentsThisMonth,
                fillRate: parseFloat(fillRate)
            },
            charts: {
                monthlyRevenue,
                patientGrowth,
                statusBreakdown
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
};

exports.getDentistMetrics = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        // DATEONLY typically requires YYYY-MM-DD string to avoid timezone confusion
        const dateString = today.toISOString().split('T')[0];

        // Formatted time for comparison
        const currentTime = today.getHours().toString().padStart(2, '0') + ':' + today.getMinutes().toString().padStart(2, '0');

        // 1. Appointments Today
        const appointmentsToday = await Appointment.findAll({
            where: {
                dentistId: userId,
                appointmentDate: dateString,
                active: true,
                status: { [Op.ne]: 'cancelled' }
            },
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['firstName', 'lastName', 'hn']
                }
            ],
            order: [['startTime', 'ASC']]
        });

        const todayAppointmentsCount = appointmentsToday.length;

        // 2. Waiting Queue (Scheduled or Confirmed and time is passed or approaching)
        // For simplicity, we count all 'scheduled' or 'confirmed' for today as waiting/upcoming
        // You might want to filter by those who haven't completed yet
        const waitingQueueCount = appointmentsToday.filter(app =>
            ['scheduled', 'confirmed'].includes(app.status)
        ).length;

        // 3. Next Patient
        // Find the first appointment that hasn't started yet or is in specific status
        // We'll look for the first one with startTime >= now

        // Note: In a real app, you might compare time strings more carefully or use Date objects
        let nextApp = appointmentsToday.find(app =>
            app.startTime >= currentTime && ['scheduled', 'confirmed'].includes(app.status)
        );

        // If no future appointment, maybe currently in progress?
        if (!nextApp) {
            nextApp = appointmentsToday.find(app => app.status === 'in-progress');
        }

        // If still none, maybe the next one generally (even if time passed but not completed?) 
        // fallback to first non-completed
        if (!nextApp) {
            nextApp = appointmentsToday.find(app => ['scheduled', 'confirmed'].includes(app.status));
        }

        const nextPatientData = nextApp ? {
            name: `${nextApp.patient.firstName} ${nextApp.patient.lastName}`,
            time: nextApp.startTime.slice(0, 5), // HH:MM
            treatment: nextApp.serviceType,
            id: nextApp.patient.hn
        } : null;

        res.json({
            todayAppointments: todayAppointmentsCount,
            waitingQueue: waitingQueueCount,
            nextPatient: nextPatientData,
            avgWait: "15m" // Hardcoded for now
        });

    } catch (error) {
        console.error('Error fetching dentist metrics:', error);
        res.status(500).json({ error: 'Failed to fetch dentist metrics' });
    }
};
