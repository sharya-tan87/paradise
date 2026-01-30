import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ViewReceiptModal = ({ isOpen, onClose, invoice }) => {
    const { t } = useTranslation();
    const printRef = useRef();

    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt ${invoice.invoiceNumber}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Prompt', 'Helvetica Neue', sans-serif; padding: 40px; color: #1a365d; }
                    .receipt-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px; }
                    .receipt-header h1 { color: #0d9488; font-size: 24px; margin-bottom: 4px; text-transform: uppercase; }
                    .receipt-header h2 { font-size: 16px; color: #64748b; font-weight: normal; }
                    .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .info-col { width: 48%; }
                    .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                    .value { font-size: 14px; font-weight: 500; color: #334155; margin-bottom: 12px; }
                    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .table th { text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                    .table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
                    .totals { margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #64748b; }
                    .grand-total { font-size: 18px; font-weight: bold; color: #0d9488; margin-top: 10px; }
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; }
                    .stamp { 
                        border: 2px solid #0d9488; color: #0d9488; display: inline-block; 
                        padding: 8px 20px; text-transform: uppercase; font-weight: bold; 
                        letter-spacing: 1px; transform: rotate(-5deg); margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const lineItems = invoice.lineItems || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">{t('receipt.detailsTitle', 'Receipt Details')}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-medium hover:bg-teal-100 flex items-center gap-2"
                        >
                            <Printer size={18} /> {t('common.print', 'Print')}
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content (Printable) */}
                <div ref={printRef} className="p-8 overflow-y-auto flex-grow bg-white">
                    <div className="receipt-header text-center border-b-2 border-teal-600 pb-6 mb-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            {/* Simple Logo Placeholder if needed */}
                            <h1 className="text-2xl font-bold text-teal-700 uppercase tracking-widest">Official Receipt</h1>
                        </div>
                        <h2 className="text-gray-500 font-normal">ใบเสร็จรับเงิน</h2>
                        <p className="text-xs text-gray-400 mt-2">Paradise Dental Clinic • 123 Sukhumvit Rd, Bangkok</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Received From / ได้รับเงินจาก</p>
                            <p className="font-bold text-gray-800 text-lg">{invoice.patient?.firstName} {invoice.patient?.lastName}</p>
                            <p className="text-sm text-gray-500">HN: {invoice.patientHN}</p>
                            <p className="text-sm text-gray-500">{invoice.patient?.address || '-'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Receipt No. / เลขที่ใบเสร็จ</p>
                            <p className="font-mono font-bold text-gray-800 mb-3">{invoice.invoiceNumber}-RCP</p>

                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date / วันที่</p>
                            <p className="font-medium text-gray-800">
                                {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <table className="w-full mb-6 text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-gray-500 font-normal uppercase text-xs">Description / รายการ</th>
                                <th className="text-right py-2 text-gray-500 font-normal uppercase text-xs">Amount / จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                    <td className="py-3 text-gray-700">{item.description}</td>
                                    <td className="py-3 text-right font-mono text-gray-700">฿{parseFloat(item.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t border-dashed border-gray-300 pt-4">
                        <div className="flex justify-between text-gray-500 mb-1">
                            <span>Subtotal / รวมเป็นเงิน</span>
                            <span className="font-mono">฿{parseFloat(invoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {parseFloat(invoice.discount) > 0 && (
                            <div className="flex justify-between text-gray-500 mb-1">
                                <span>Discount / ส่วนลด</span>
                                <span className="font-mono">-฿{parseFloat(invoice.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        {invoice.vatIncluded && (
                            <div className="flex justify-between text-gray-500 mb-1">
                                <span>VAT (7%) / ภาษีมูลค่าเพิ่ม</span>
                                <span className="font-mono">฿{parseFloat(invoice.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <span className="font-bold text-gray-800 text-lg">Current Payment / ยอดชำระครั้งนี้</span>
                            <span className="font-bold text-2xl text-teal-700">฿{parseFloat(invoice.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Paid by: {invoice.paymentMethod || 'Cash'}</span>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-block border-2 border-teal-600 text-teal-600 px-8 py-2 text-xl font-bold uppercase tracking-widest transform -rotate-3 opacity-80">
                            PAID / ชำระแล้ว
                        </div>
                        <p className="mt-8 text-xs text-gray-400">Authorized Signature</p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-center">
                    <p className="text-xs text-gray-400">Thank you for trusting Paradise Dental Clinic</p>
                </div>
            </div>
        </div>
    );
};

export default ViewReceiptModal;
