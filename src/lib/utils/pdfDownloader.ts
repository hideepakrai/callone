import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderModel } from '@/store/slices/order/OrderType';
import { UserInterface } from '@/store/slices/users/userSlice';

export const downloadOrderPDF = async (
  order: OrderModel,
  retailers: UserInterface[],
  managers: UserInterface[],
  allSaleRep: UserInterface[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const getRetailer = (id?: string) => {
    if (!id) return null;
    return retailers.find((r) => r._id === id || r.id?.toString() === id) || null;
  };

  const getManagerName = (id?: string | null) => {
    if (!id) return "N/A";
    const manager = managers.find((m) => m._id === id || m.id?.toString() === id);
    return manager?.name || "Unknown Manager";
  };

  const getSalesRepName = (id?: string) => {
    if (!id) return "N/A";
    const salesRep = allSaleRep.find((s) => s._id === id || s.id?.toString() === id);
    return salesRep?.name || "Unknown Sales Rep";
  };

  const retailer = getRetailer(order.retailer_id);
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "N/A";

  // --- HEADER SECTION ---
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo
  try {
    const logoUrl = '/images/brands/callaway-logo-white.png';
    doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 25, 5, 50, 20);
  } catch (e) {
    console.error("Logo not found", e);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('ORDER PDF', pageWidth - 20, 15, { align: 'right' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${order.orderNumber || order.id || 'N/A'}`, pageWidth - 20, 25, { align: 'right' });

  // --- DETAILS SECTION ---
  doc.setTextColor(0, 0, 0);
  let y = 50;

  // Left Side: Retailer Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(retailer?.name || 'Customer Name', 14, y);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`GSTIN: ${retailer?.gstin || 'N/A'}`, 14, y + 6);
  doc.text(`Address:`, 14, y + 12);
  doc.text(retailer?.address || 'N/A', 14, y + 18, { maxWidth: 80 });

  // Right Side: Order Info
  doc.setTextColor(0, 0, 0);
  const rightX = pageWidth - 14;
  doc.text(`Date: ${orderDate}`, rightX, y, { align: 'right' });
  doc.text(`Company: Callaway Golf India Pvt. Ltd.`, rightX, y + 8, { align: 'right' });
  doc.text(`Manager: ${getManagerName(order.manager_id)}`, rightX, y + 16, { align: 'right' });
  doc.text(`Sales Rep: ${getSalesRepName(order.salesrep_id)}`, rightX, y + 24, { align: 'right' });

  y += 35;

  // --- ITEMS TABLE ---
  const items = order.items || [];
  const itemsBody = items.map((item) => [
    item.brand || 'N/A',
    item.sku || 'N/A',
    item.description || 'N/A',
    item.qty || (item.qty88 || 0) + (item.qty90 || 0),
    `Rs. ${item.mrp || 0}`,
    `${item.discount !== undefined ? item.discount : order.discount_percent || 0}%`,
    `Rs. ${item.finalAmount || item.amount || 0}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Brand', 'SKU', 'Description', 'QTY', 'MRP', 'Discount (%)', 'Amount']],
    body: itemsBody,
    theme: 'grid',
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      2: { cellWidth: 50 }, // Description
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // --- SUMMARY SECTION ---
  const subTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Discount Type: ${order.discount_type || 'Inclusive'}`, 14, y + 5);

  const summaryX = pageWidth - 60;
  autoTable(doc, {
    startY: y,
    margin: { left: summaryX },
    body: [
      ['Sub Total:', `Rs. ${subTotal?.toLocaleString()}`],
      ['Discount:', `Rs. ${order.discountAmount?.toLocaleString() || 0}`],
      ['Total:', `Rs. ${order.totalAmount?.toLocaleString() || 0}`],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'normal', halign: 'left' },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    didParseCell: (data: any) => {
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });

  // Notes
  if (order.note && order.note.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, y);
    doc.setFont('helvetica', 'normal');
    order.note.forEach((note, index) => {
      doc.text(`- ${note.message}`, 14, y + 6 + (index * 6));
    });
  }

  doc.save(`Order_${order.orderNumber || order.id || 'N-A'}.pdf`);
};
