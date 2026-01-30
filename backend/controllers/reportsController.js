const { Invoice, Patient } = require('../models');
const { Op, fn, col } = require('sequelize');
const pdfGenerator = require('../utils/pdfGenerator');
const csvGenerator = require('../utils/csvGenerator');

// Helper: parse date range from query
const parseDateRange = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    return { start, end };
};

// P&L Report
exports.generatePandL = async (req, res) => {
    try {
        const { startDate, endDate, format = 'pdf' } = req.query;
        const { start, end } = parseDateRange(startDate, endDate);

        // Calculate Total Revenue (paid invoices)
        const totalRevenue = await Invoice.sum('totalAmount', {
            where: {
                paymentStatus: 'paid',
                invoiceDate: { [Op.between]: [start, end] }
            }
        }) || 0;

        // Count invoices
        const invoiceCount = await Invoice.count({
            where: {
                paymentStatus: 'paid',
                invoiceDate: { [Op.between]: [start, end] }
            }
        });

        // For now, expenses are 0 (Expense model from Story 5.4 not implemented yet)
        const totalExpenses = 0;
        const netProfit = totalRevenue - totalExpenses;

        const data = {
            dateRange: {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            },
            totalRevenue,
            invoiceCount,
            totalExpenses,
            netProfit
        };

        if (format === 'csv') {
            const csv = csvGenerator.generatePandLCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=p-and-l_${data.dateRange.startDate}_${data.dateRange.endDate}.csv`);
            return res.send(csv);
        } else {
            const pdfBuffer = await pdfGenerator.generatePandLPDF(data);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=p-and-l_${data.dateRange.startDate}_${data.dateRange.endDate}.pdf`);
            return res.send(pdfBuffer);
        }
    } catch (error) {
        console.error('Error generating P&L report:', error);
        res.status(500).json({ error: 'Failed to generate P&L report' });
    }
};

// Daily Collections Report
exports.generateDailyCollections = async (req, res) => {
    try {
        const { startDate, endDate, format = 'pdf' } = req.query;
        const { start, end } = parseDateRange(startDate, endDate);

        // Get paid invoices with patient info
        const invoices = await Invoice.findAll({
            where: {
                paymentStatus: 'paid',
                paymentDate: { [Op.between]: [start, end] }
            },
            include: [{
                model: Patient,
                as: 'patient',
                attributes: ['firstName', 'lastName']
            }],
            order: [['paymentDate', 'ASC']]
        });

        const collections = invoices.map(inv => ({
            date: inv.paymentDate,
            invoiceNumber: inv.invoiceNumber,
            patientName: inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : 'Unknown',
            amount: parseFloat(inv.totalAmount),
            paymentMethod: inv.paymentMethod
        }));

        const totalAmount = collections.reduce((sum, c) => sum + c.amount, 0);

        const data = {
            dateRange: {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            },
            collections,
            totalAmount
        };

        if (format === 'csv') {
            const csv = csvGenerator.generateDailyCollectionsCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=daily-collections_${data.dateRange.startDate}_${data.dateRange.endDate}.csv`);
            return res.send(csv);
        } else {
            const pdfBuffer = await pdfGenerator.generateDailyCollectionsPDF(data);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=daily-collections_${data.dateRange.startDate}_${data.dateRange.endDate}.pdf`);
            return res.send(pdfBuffer);
        }
    } catch (error) {
        console.error('Error generating Daily Collections report:', error);
        res.status(500).json({ error: 'Failed to generate Daily Collections report' });
    }
};

// Monthly Summary Report
exports.generateMonthlySummary = async (req, res) => {
    try {
        const { startDate, endDate, format = 'pdf' } = req.query;
        const { start, end } = parseDateRange(startDate, endDate);

        // Group invoices by month
        const monthlyData = await Invoice.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('invoiceDate'), '%Y-%m'), 'monthKey'],
                [fn('SUM', col('totalAmount')), 'revenue'],
                [fn('COUNT', col('id')), 'invoiceCount'],
                [fn('AVG', col('totalAmount')), 'averageInvoice']
            ],
            where: {
                paymentStatus: 'paid',
                invoiceDate: { [Op.between]: [start, end] }
            },
            group: [fn('DATE_FORMAT', col('invoiceDate'), '%Y-%m')],
            order: [[fn('DATE_FORMAT', col('invoiceDate'), '%Y-%m'), 'ASC']],
            raw: true
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const months = monthlyData.map(item => {
            const [year, month] = item.monthKey.split('-');
            return {
                month: `${monthNames[parseInt(month) - 1]} ${year}`,
                revenue: parseFloat(item.revenue) || 0,
                invoiceCount: parseInt(item.invoiceCount) || 0,
                averageInvoice: parseFloat(item.averageInvoice) || 0
            };
        });

        const grandTotal = months.reduce((sum, m) => sum + m.revenue, 0);

        const data = {
            dateRange: {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            },
            months,
            grandTotal
        };

        if (format === 'csv') {
            const csv = csvGenerator.generateMonthlySummaryCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=monthly-summary_${data.dateRange.startDate}_${data.dateRange.endDate}.csv`);
            return res.send(csv);
        } else {
            const pdfBuffer = await pdfGenerator.generateMonthlySummaryPDF(data);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=monthly-summary_${data.dateRange.startDate}_${data.dateRange.endDate}.pdf`);
            return res.send(pdfBuffer);
        }
    } catch (error) {
        console.error('Error generating Monthly Summary report:', error);
        res.status(500).json({ error: 'Failed to generate Monthly Summary report' });
    }
};
