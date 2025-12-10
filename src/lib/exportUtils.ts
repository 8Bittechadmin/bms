// Utilities for exporting data to XLSX and PDF and parsing CSV/JSON imports
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

export const exportJsonToXlsx = (data: any[], filename = 'export') => {
  if (!data || data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}.xlsx`);
};

export const exportJsonToCsv = (data: any[], filename = 'export') => {
  if (!data || data.length === 0) return;
  const header = Object.keys(data[0]).join(',') + '\n';
  const csv = header + data.map(row => {
    return Object.values(row).map(value => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return '"' + JSON.stringify(value).replace(/"/g, '""') + '"';
      const s = String(value);
      if (s.includes(',') || s.includes('\n') || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',');
  }).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

export const exportJsonToPdf = (data: any[], filename = 'export') => {
  if (!data || data.length === 0) return;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const columns = Object.keys(data[0]).map(key => ({ header: key, dataKey: key }));
  // @ts-ignore
  doc.autoTable({
    columns,
    body: data,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 116, 240] }
  });
  doc.save(`${filename}.pdf`);
};

export const exportBookingsToPdf = async (bookings: any[], filename = "bookings") => {
  if (!bookings || bookings.length === 0) return;

  const doc = new jsPDF({
    unit: "pt",
    format: "a4"
  });

  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const CENTER = PAGE_WIDTH / 2;

  /* -------------------------------
      LOAD LOGO (OPTIONAL)
  --------------------------------*/
  const logoUrl = "https://techsreni.com/images/logo.png";

  const loadImage = (url: string) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });

  const logo: any = await loadImage(logoUrl);

  /* -------------------------------
      COVER PAGE
  --------------------------------*/
  doc.setFillColor(40, 116, 240);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_WIDTH, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(30);
  doc.text("Bookings Report", CENTER, 180, { align: "center" });

  doc.setFontSize(14);
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    CENTER,
    220,
    { align: "center" }
  );

  if (logo) {
    doc.addImage(logo, "PNG", CENTER - 60, 260, 120, 120);
  }

  doc.setFontSize(12);
  doc.text(
    "Prepared by TechSreni – Event Management Software",
    CENTER,
    420,
    { align: "center" }
  );

  doc.addPage();

  /* -------------------------------
      SUMMARY ANALYTICS
  --------------------------------*/
  const totalBookings = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.total_amount || 0),
    0
  );

  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Summary Overview", 40, 60);

  doc.setFontSize(12);

  const yStart = 100;

  doc.text(`Total Bookings: ${totalBookings}`, 40, yStart);
  doc.text(`Confirmed: ${confirmed}`, 40, yStart + 20);
  doc.text(`Pending: ${pending}`, 40, yStart + 40);
  doc.text(`Cancelled: ${cancelled}`, 40, yStart + 60);

  doc.text(
    `Total Revenue: ₹${totalRevenue.toLocaleString()}`,
    40,
    yStart + 100
  );

  /* -------------------------------
      STATUS LEGEND
  --------------------------------*/
  const drawLegend = (text: string, color: number[], x: number, y: number) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y - 10, 14, 14, "F");
    doc.setTextColor(40);
    doc.text(text, x + 24, y);
  };

  const statusColors = {
    confirmed: [46, 204, 113],
    pending: [243, 156, 18],
    cancelled: [231, 76, 60]
  };

  drawLegend("Confirmed", statusColors.confirmed, 280, yStart);
  drawLegend("Pending", statusColors.pending, 280, yStart + 25);
  drawLegend("Cancelled", statusColors.cancelled, 280, yStart + 50);

  doc.addPage();

  /* -------------------------------
      COLUMN SETUP
  --------------------------------*/
  const columns = [
    { header: "ID", dataKey: "id" },
    { header: "Client", dataKey: "client" },
    { header: "Event", dataKey: "event_name" },
    { header: "Venue", dataKey: "venue" },
    { header: "Start", dataKey: "start_date" },
    { header: "End", dataKey: "end_date" },
    { header: "Guests", dataKey: "guest_count" },
    { header: "Total", dataKey: "total_amount" },
    { header: "Status", dataKey: "status" },
    { header: "Notes", dataKey: "notes" }
  ];

  const body = bookings.map((b) => ({
    id: b.id.slice(0, 8),
    client: b.client?.name || "—",
    event_name: b.event_name || "",
    venue: b.venue?.name || "",
    start_date: new Date(b.start_date).toLocaleString(),
    end_date: new Date(b.end_date).toLocaleString(),
    guest_count: b.guest_count ?? "",
    total_amount: b.total_amount?.toLocaleString() ?? "",
    status: b.status,
    notes: b.notes || ""
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return statusColors.confirmed;
      case "pending":
        return statusColors.pending;
      case "cancelled":
        return statusColors.cancelled;
      default:
        return [128, 128, 128];
    }
  };

  /* -------------------------------
      DATA TABLE
  --------------------------------*/
  // @ts-ignore
  doc.autoTable({
    startY: 40,
    head: [columns.map((c) => c.header)],
    body: body.map((row) => columns.map((c) => row[c.dataKey])),

    tableWidth: "wrap",

    styles: {
      fontSize: 9,
      overflow: "linebreak",
      cellPadding: 6
    },

    headStyles: {
      fillColor: [40, 116, 240],
      textColor: 255,
      fontSize: 10,
      halign: "center"
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },

    columnStyles: {
      id: { cellWidth: 55 },
      client: { cellWidth: 90 },
      event_name: { cellWidth: 80 },
      venue: { cellWidth: 80 },
      start_date: { cellWidth: 90 },
      end_date: { cellWidth: 90 },
      guest_count: { cellWidth: 45, halign: "right" },
      total_amount: { cellWidth: 55, halign: "right" },
      status: { cellWidth: 60, halign: "center" },
      notes: { cellWidth: 120 }
    },

    didParseCell: (data) => {
      if (data.column.index === 8 && data.cell.section === "body") {
        const status = data.cell.raw;
        const color = getStatusColor(status);
        data.cell.styles.fillColor = color;
        data.cell.styles.textColor = [255, 255, 255];
      }
    },

    didDrawPage: () => {
      const page = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${page}`,
        PAGE_WIDTH - 60,
        doc.internal.pageSize.getHeight() - 20
      );
    }
  });

  /* -------------------------------
      SAVE FILE
  --------------------------------*/
  doc.save(`${filename}.pdf`);
};


export const parseCsvFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as any[]);
      },
      error: (err) => reject(err)
    });
  });
};

export const downloadJson = (obj: any, filename = 'backup') => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

export const readJsonFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
