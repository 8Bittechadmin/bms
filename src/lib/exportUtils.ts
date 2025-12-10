// Utilities for exporting data to XLSX and PDF and parsing CSV/JSON imports
import { saveAs } from 'file-saver';
import XLSX from 'xlsx';
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

export const exportBookingsToPdf = (bookings: any[], filename = 'bookings') => {
  if (!bookings || bookings.length === 0) return;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const title = 'Bookings Report';
  const generatedAt = new Date().toLocaleString();

  doc.setFontSize(14);
  doc.text(title, 40, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt}`, 40, 58);

  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Client', dataKey: 'client' },
    { header: 'Event Name', dataKey: 'event_name' },
    { header: 'Event Type', dataKey: 'event_type' },
    { header: 'Venue', dataKey: 'venue' },
    { header: 'Start Date', dataKey: 'start_date' },
    { header: 'End Date', dataKey: 'end_date' },
    { header: 'Guests', dataKey: 'guest_count' },
    { header: 'Total', dataKey: 'total_amount' },
    { header: 'Deposit', dataKey: 'deposit_amount' },
    { header: 'Deposit Paid', dataKey: 'deposit_paid' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Notes', dataKey: 'notes' }
  ];

  const body = bookings.map(b => ({
    id: String(b.id).substring(0, 12),
    client: b.client?.name || '',
    event_name: b.event_name || '',
    event_type: b.event_type || '',
    venue: b.venue?.name || '',
    start_date: b.start_date ? new Date(b.start_date).toLocaleString() : '',
    end_date: b.end_date ? new Date(b.end_date).toLocaleString() : '',
    guest_count: b.guest_count ?? '',
    total_amount: b.total_amount != null ? String(b.total_amount) : '',
    deposit_amount: b.deposit_amount != null ? String(b.deposit_amount) : '',
    deposit_paid: b.deposit_paid ? 'Yes' : 'No',
    status: b.status || '',
    notes: b.notes ? String(b.notes) : ''
  }));

  // @ts-ignore
  doc.autoTable({
    columns,
    body,
    startY: 80,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 116, 240] },
    columnStyles: {
      notes: { cellWidth: 160 }
    },
    didDrawPage: (dataArg: any) => {
      // footer with page number
      const page = doc.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(`Page ${page}`, doc.internal.pageSize.getWidth() - 60, doc.internal.pageSize.getHeight() - 20);
    }
  });

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
