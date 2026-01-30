const PDFDocument = require('pdfkit');

// Brand colors
const COLORS = {
    deepNavy: '#214491',
    tealBlue: '#2D7C9C',
    lightBlue: '#CEE0F3',
    black: '#000000',
    gray: '#666666'
};

// Common PDF header
const addHeader = (doc, title, dateRange) => {
    doc.fontSize(24).fillColor(COLORS.deepNavy).text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor(COLORS.tealBlue).text(`Paradise Dental Clinic`, { align: 'center' });
    doc.fontSize(10).fillColor(COLORS.gray).text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, { align: 'center' });
    doc.moveDown(1);

    // Divider line
    doc.strokeColor(COLORS.lightBlue).lineWidth(2)
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
};

// Common PDF footer
const addFooter = (doc) => {
    const bottom = doc.page.height - 50;
    doc.fontSize(8).fillColor(COLORS.gray)
        .text(`Generated on ${new Date().toLocaleString()}`, 50, bottom, { align: 'center' })
        .text('Paradise Dental Clinic - Confidential', 50, bottom + 12, { align: 'center' });
};

// P&L Report PDF
exports.generatePandLPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            addHeader(doc, 'Profit & Loss Report', data.dateRange);

            // Revenue Section
            doc.fontSize(14).fillColor(COLORS.deepNavy).text('Revenue', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(11).fillColor(COLORS.black);
            doc.text(`Total Revenue: ฿${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
            doc.fontSize(10).fillColor(COLORS.gray).text(`(${data.invoiceCount} paid invoices)`);
            doc.moveDown(1);

            // Expenses Section (placeholder if no expense model yet)
            doc.fontSize(14).fillColor(COLORS.deepNavy).text('Expenses', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(11).fillColor(COLORS.black);
            doc.text(`Total Expenses: ฿${(data.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
            doc.moveDown(1);

            // Summary
            doc.fontSize(14).fillColor(COLORS.deepNavy).text('Summary', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12).fillColor(COLORS.tealBlue);
            doc.text(`Net Profit: ฿${data.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);

            addFooter(doc);
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

// Daily Collections Report PDF
exports.generateDailyCollectionsPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            addHeader(doc, 'Daily Collections Report', data.dateRange);

            // Table header
            const tableTop = doc.y;
            const colWidths = [80, 100, 180, 100, 100];
            const headers = ['Date', 'Invoice #', 'Patient', 'Amount', 'Method'];

            doc.fontSize(10).fillColor(COLORS.deepNavy);
            let xPos = 50;
            headers.forEach((header, i) => {
                doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
                xPos += colWidths[i];
            });

            doc.strokeColor(COLORS.tealBlue).lineWidth(1)
                .moveTo(50, tableTop + 15).lineTo(750, tableTop + 15).stroke();

            // Table rows
            let yPos = tableTop + 25;
            doc.fontSize(9).fillColor(COLORS.black);

            data.collections.forEach((row, idx) => {
                if (yPos > 500) {
                    doc.addPage();
                    yPos = 50;
                }

                xPos = 50;
                doc.text(row.date, xPos, yPos, { width: colWidths[0] });
                xPos += colWidths[0];
                doc.text(row.invoiceNumber, xPos, yPos, { width: colWidths[1] });
                xPos += colWidths[1];
                doc.text(row.patientName, xPos, yPos, { width: colWidths[2] });
                xPos += colWidths[2];
                doc.text(`฿${parseFloat(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, xPos, yPos, { width: colWidths[3] });
                xPos += colWidths[3];
                doc.text(row.paymentMethod || '-', xPos, yPos, { width: colWidths[4] });

                yPos += 18;
            });

            // Total
            doc.moveDown(2);
            doc.fontSize(12).fillColor(COLORS.tealBlue)
                .text(`Total Collections: ฿${data.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 50, yPos + 20);

            addFooter(doc);
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

// Monthly Summary Report PDF
exports.generateMonthlySummaryPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            addHeader(doc, 'Monthly Revenue Summary', data.dateRange);

            // Table header
            const tableTop = doc.y;
            const colWidths = [120, 120, 100, 120];
            const headers = ['Month', 'Total Revenue', 'Invoices', 'Avg Invoice'];

            doc.fontSize(11).fillColor(COLORS.deepNavy);
            let xPos = 50;
            headers.forEach((header, i) => {
                doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
                xPos += colWidths[i];
            });

            doc.strokeColor(COLORS.tealBlue).lineWidth(1)
                .moveTo(50, tableTop + 18).lineTo(500, tableTop + 18).stroke();

            // Table rows
            let yPos = tableTop + 28;
            doc.fontSize(10).fillColor(COLORS.black);

            data.months.forEach((row) => {
                xPos = 50;
                doc.text(row.month, xPos, yPos, { width: colWidths[0] });
                xPos += colWidths[0];
                doc.text(`฿${parseFloat(row.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, xPos, yPos, { width: colWidths[1] });
                xPos += colWidths[1];
                doc.text(row.invoiceCount.toString(), xPos, yPos, { width: colWidths[2] });
                xPos += colWidths[2];
                doc.text(`฿${parseFloat(row.averageInvoice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, xPos, yPos, { width: colWidths[3] });

                yPos += 20;
            });

            // Grand Total
            doc.moveDown(2);
            doc.fontSize(12).fillColor(COLORS.tealBlue)
                .text(`Grand Total: ฿${data.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 50, yPos + 20);

            addFooter(doc);
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
