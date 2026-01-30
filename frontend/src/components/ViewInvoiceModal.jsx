import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

const ViewInvoiceModal = ({ isOpen, onClose, invoice }) => {
    const printRef = useRef();

    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Prompt', 'Helvetica Neue', sans-serif; padding: 40px; color: #1a365d; }
                    .invoice-header { text-align: center; margin-bottom: 40px; }
                    .invoice-header h1 { color: #0d9488; font-size: 28px; margin-bottom: 8px; }
                    .invoice-header p { color: #64748b; font-size: 14px; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .invoice-details div { text-align: left; }
                    .invoice-details h3 { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
                    .invoice-details p { font-size: 14px; color: #1e293b; line-height: 1.6; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; padding: 12px; text-align: left; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    .totals { text-align: right; }
                    .totals div { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 8px; }
                    .totals .total-row { font-size: 18px; font-weight: bold; color: #0d9488; border-top: 2px solid #0d9488; padding-top: 12px; }
                    .footer { text-align: center; margin-top: 60px; color: #94a3b8; font-size: 12px; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <div class="footer">
                    <p>Paradise Dental Clinic • Thank you for your patronage!</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const lineItems = invoice.lineItems || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-primary-900">Invoice Details</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 flex items-center gap-2"
                        >
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content (Printable) */}
                <div ref={printRef} className="p-8 overflow-y-auto flex-grow">
                    {/* Invoice Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-teal-600">Paradise Dental Clinic</h1>
                        <p className="text-gray-500 mt-1">123 Sukhumvit Rd, Bangkok 10110</p>
                        <p className="text-gray-500">Tel: 02-XXX-XXXX</p>
                    </div>

                    {/* Invoice Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xs text-gray-500 uppercase font-semibold mb-2">Bill To</h3>
                            <p className="font-bold text-gray-900">
                                {invoice.patient?.firstName} {invoice.patient?.lastName}
                            </p>
                            <p className="text-gray-600 text-sm">HN: {invoice.patientHN}</p>
                            {invoice.patient?.phone && <p className="text-gray-600 text-sm">Phone: {invoice.patient.phone}</p>}
                            {invoice.patient?.address && <p className="text-gray-600 text-sm">{invoice.patient.address}</p>}
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs text-gray-500 uppercase font-semibold mb-2">Invoice</h3>
                            <p className="font-bold text-xl text-teal-600">{invoice.invoiceNumber}</p>
                            <p className="text-gray-600 text-sm">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                            {invoice.dueDate && <p className="text-gray-600 text-sm">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>}
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                    invoice.paymentStatus === 'partially-paid' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {invoice.paymentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <table className="w-full mb-6">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                                <th className="text-left p-3 rounded-l-lg">Description</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-right p-3 rounded-r-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="p-3 text-gray-800">{item.description}</td>
                                    <td className="p-3 text-gray-600 text-sm">{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                                    <td className="p-3 text-right font-mono text-gray-800">฿{parseFloat(item.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-mono">฿{parseFloat(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>VAT (7%)</span>
                                <span className="font-mono">฿{parseFloat(invoice.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-teal-600 pt-2 border-t-2 border-teal-600">
                                <span>Total</span>
                                <span className="font-mono">฿{parseFloat(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {invoice.paymentStatus === 'paid' && (
                        <div className="mt-8 bg-green-50 p-4 rounded-lg text-center">
                            <p className="text-green-700 font-semibold">Payment Received</p>
                            <p className="text-green-600 text-sm">
                                {invoice.paymentMethod && `Method: ${invoice.paymentMethod}`}
                                {invoice.paymentDate && ` • Date: ${new Date(invoice.paymentDate).toLocaleDateString()}`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoiceModal;
