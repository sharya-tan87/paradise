const { Parser } = require('json2csv');

// P&L Report CSV
exports.generatePandLCSV = (data) => {
    const rows = [
        { Category: 'Revenue', Description: 'Total Revenue', Amount: data.totalRevenue },
        { Category: 'Revenue', Description: 'Invoice Count', Amount: data.invoiceCount },
        { Category: 'Expenses', Description: 'Total Expenses', Amount: data.totalExpenses || 0 },
        { Category: 'Summary', Description: 'Net Profit', Amount: data.netProfit }
    ];

    const parser = new Parser({ fields: ['Category', 'Description', 'Amount'] });
    return parser.parse(rows);
};

// Daily Collections Report CSV
exports.generateDailyCollectionsCSV = (data) => {
    const rows = data.collections.map(item => ({
        Date: item.date,
        'Invoice Number': item.invoiceNumber,
        'Patient Name': item.patientName,
        Amount: parseFloat(item.amount).toFixed(2),
        'Payment Method': item.paymentMethod || '-'
    }));

    // Add total row
    rows.push({
        Date: '',
        'Invoice Number': '',
        'Patient Name': 'TOTAL',
        Amount: data.totalAmount.toFixed(2),
        'Payment Method': ''
    });

    const parser = new Parser({ fields: ['Date', 'Invoice Number', 'Patient Name', 'Amount', 'Payment Method'] });
    return parser.parse(rows);
};

// Monthly Summary Report CSV
exports.generateMonthlySummaryCSV = (data) => {
    const rows = data.months.map(item => ({
        Month: item.month,
        'Total Revenue': parseFloat(item.revenue).toFixed(2),
        'Invoice Count': item.invoiceCount,
        'Average Invoice': parseFloat(item.averageInvoice).toFixed(2)
    }));

    // Add total row
    rows.push({
        Month: 'GRAND TOTAL',
        'Total Revenue': data.grandTotal.toFixed(2),
        'Invoice Count': data.months.reduce((sum, m) => sum + m.invoiceCount, 0),
        'Average Invoice': ''
    });

    const parser = new Parser({ fields: ['Month', 'Total Revenue', 'Invoice Count', 'Average Invoice'] });
    return parser.parse(rows);
};
