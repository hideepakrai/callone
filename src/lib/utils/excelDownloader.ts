import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { OrderModel, NoteModel } from '@/store/slices/order/OrderType';
import { UserInterface } from '@/store/slices/users/userSlice';

export const downloadOrderExcel = async (
  order: OrderModel,
  retailers: UserInterface[],
  managers: UserInterface[]
) => {
  let orderDate = "N/A";
  let orderTime = "N/A";

  if (order.created_at) {
    const date = new Date(order.created_at);
    orderDate = date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    orderTime = date.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' });
  }

  const getRetailerName = (id?: string) => {
    if (!id) return "N/A";
    const retailer = retailers.find((r) => r._id === id || r.id?.toString() === id);
    return retailer?.name || "Unknown Retailer";
  };

  const getManagerName = (id?: string | null) => {
    if (!id) return "N/A";
    const manager = managers.find((m) => m._id === id || m.id?.toString() === id);
    return manager?.name || "Unknown Manager";
  };

  try {
    if (!order.items) {
      console.error("No items in order.");
      return null;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Order Details");

    // Define the first section of data (summary)
    worksheet.columns = [
      { header: "Order Id", width: 20 },
      { header: "Status", width: 15 },
      { header: "Manager Name", width: 25 },
      { header: "Retailer Name", width: 25 },
      { header: "Date", width: 15 },
      { header: "Time", width: 15 },
    ];

    const summaryData = [
      [
        order.orderNumber || order.id || "N/A",
        order.status || "pending",
        getManagerName(order.manager_id),
        getRetailerName(order.retailer_id),
        orderDate,
        orderTime,
      ],
    ];

    // Add summary data to worksheet
    summaryData.forEach((row, index) => {
      worksheet.addRow(row);
      if (index === 0) {
        worksheet.getRow(index + 2).eachCell((cell: ExcelJS.Cell) => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      }
    });

    // Style summary header (which is actually worksheet.getRow(1))
    worksheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.addRow([]); // Add an empty row between sections

    // Add order details data
    const detailsHeader = [
      "Brand",
      "SKU",
      "Description",
      "Quantity 90",
      "Quantity 88",
      "MRP",
      "Discount (%)",
      "Amount",
    ];
    
    const detailsData = order.items.map((row) => [
      row.brand || "N/A",
      row.sku || "N/A",
      row.description || "N/A",
      row.qty90 || 0,
      row.qty88 || 0,
      row.mrp || 0,
      row.discount !== undefined ? row.discount : order.discount_percent || 0,
      row.finalAmount || 0,
    ]);

    // Add header
    const headerRow = worksheet.addRow(detailsHeader);
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFFFFFFF" } },
        left: { style: "thin", color: { argb: "FFFFFFFF" } },
        bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
        right: { style: "thin", color: { argb: "FFFFFFFF" } },
      };
    });

    // Add order details to worksheet
    detailsData.forEach((row) => {
      const addedRow = worksheet.addRow(row);
      addedRow.eachCell((cell: ExcelJS.Cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    });

    worksheet.addRow([]); // Add an empty row before financial summary

    // Add financial summary section
    const subTotal = order.items.reduce((acc, item) => acc + (item.amount || 0), 0);
    const financialSummaryData = [
      ["Financial Summary", ""],
      ["Discount Type", order.discount_type || "N/A"],
      ["Sub Total", subTotal || "0"],
      ["Discount Amount", order.discountAmount || "0"],
      ["Total", order.totalAmount || "0"],
    ];

    financialSummaryData.forEach((row, index) => {
      const addedRow = worksheet.addRow(row);
      if (index === 0) {
        addedRow.eachCell((cell: ExcelJS.Cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      } else {
        addedRow.eachCell((cell: ExcelJS.Cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        });
      }
    });

    // Add Notes data
    if (order.note && order.note.length > 0) {
      worksheet.addRow([]); // Add an empty row before Notes section
      const notesHeaderRow = worksheet.addRow(["Notes"]);
      notesHeaderRow.eachCell((cell: ExcelJS.Cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      order.note.forEach((note) => {
        const noteRow = worksheet.addRow([note.message]);
        noteRow.eachCell((cell: ExcelJS.Cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        });
      });
    }

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Order_${order.orderNumber || order.id || 'N-A'}.xlsx`);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return null;
  }
};
