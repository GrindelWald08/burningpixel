import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface InvoiceData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  package_name: string;
  amount: number;
  status: string;
  payment_method: string | null;
  xendit_invoice_id: string | null;
  created_at: string;
  paid_at: string | null;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Menunggu Pembayaran',
    paid: 'Lunas',
    expired: 'Kedaluwarsa',
    failed: 'Gagal',
  };
  return labels[status] || status;
};

export const generateInvoicePDF = (order: InvoiceData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];
  const successColor: [number, number, number] = [34, 197, 94];
  const warningColor: [number, number, number] = [234, 179, 8];
  const errorColor: [number, number, number] = [239, 68, 68];

  let yPos = 20;

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 28);
  
  // Invoice number on the right
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 25, { align: 'right' });
  doc.text(format(new Date(order.created_at), 'dd MMMM yyyy'), pageWidth - 20, 32, { align: 'right' });

  yPos = 55;

  // Status Badge
  const statusLabel = getStatusLabel(order.status);
  let statusColor: [number, number, number];
  
  switch (order.status) {
    case 'paid':
      statusColor = successColor;
      break;
    case 'pending':
      statusColor = warningColor;
      break;
    case 'failed':
    case 'expired':
      statusColor = errorColor;
      break;
    default:
      statusColor = mutedColor;
  }

  doc.setFillColor(...statusColor);
  doc.roundedRect(20, yPos - 5, 60, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabel, 50, yPos + 3, { align: 'center' });

  yPos += 25;

  // Customer Info Section
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Pelanggan', 20, yPos);
  
  yPos += 8;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text('Nama:', 20, yPos);
  doc.setTextColor(...textColor);
  doc.text(order.customer_name, 60, yPos);
  
  yPos += 7;
  doc.setTextColor(...mutedColor);
  doc.text('Email:', 20, yPos);
  doc.setTextColor(...textColor);
  doc.text(order.customer_email, 60, yPos);
  
  if (order.customer_phone) {
    yPos += 7;
    doc.setTextColor(...mutedColor);
    doc.text('Telepon:', 20, yPos);
    doc.setTextColor(...textColor);
    doc.text(order.customer_phone, 60, yPos);
  }

  yPos += 20;

  // Order Details Section
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Pesanan', 20, yPos);
  
  yPos += 8;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Table Header
  yPos += 10;
  doc.setFillColor(249, 250, 251);
  doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedColor);
  doc.text('DESKRIPSI', 25, yPos + 2);
  doc.text('JUMLAH', pageWidth - 25, yPos + 2, { align: 'right' });

  // Table Row
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.text(order.package_name, 25, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(order.amount), pageWidth - 25, yPos, { align: 'right' });

  // Separator
  yPos += 10;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Total
  yPos += 12;
  doc.setFillColor(249, 250, 251);
  doc.rect(pageWidth - 100, yPos - 5, 80, 14, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedColor);
  doc.text('Total:', pageWidth - 95, yPos + 3);
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.text(formatCurrency(order.amount), pageWidth - 25, yPos + 3, { align: 'right' });

  yPos += 30;

  // Payment Info Section
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Pembayaran', 20, yPos);
  
  yPos += 8;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (order.xendit_invoice_id) {
    doc.setTextColor(...mutedColor);
    doc.text('Transaction ID:', 20, yPos);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(order.xendit_invoice_id, 70, yPos);
    yPos += 7;
  }
  
  if (order.payment_method) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedColor);
    doc.text('Metode:', 20, yPos);
    doc.setTextColor(...textColor);
    doc.text(order.payment_method, 70, yPos);
    yPos += 7;
  }
  
  if (order.paid_at) {
    doc.setTextColor(...mutedColor);
    doc.text('Tanggal Bayar:', 20, yPos);
    doc.setTextColor(...textColor);
    doc.text(format(new Date(order.paid_at), 'dd MMMM yyyy, HH:mm'), 70, yPos);
    yPos += 7;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
  
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Dokumen ini digenerate secara otomatis dan sah tanpa tanda tangan.', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Order ID: ${order.id}`, pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, pageWidth / 2, footerY + 10, { align: 'center' });

  // Save the PDF
  const fileName = `invoice-${order.id.slice(0, 8)}-${format(new Date(order.created_at), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};
