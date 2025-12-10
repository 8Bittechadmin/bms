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
