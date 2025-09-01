
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExportDataProps {
  data: any[];
  filename: string;
  fileType: 'excel' | 'pdf';
}

const ExportData: React.FC<ExportDataProps> = ({ data, filename, fileType }) => {
  const exportToExcel = () => {
    if (data && data.length > 0) {
      // Create a CSV string
      const header = Object.keys(data[0]).join(',') + '\n';
      const csv = header + data.map(row => {
        return Object.values(row).map(value => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        }).join(',');
      }).join('\n');

      // Create a Blob from the CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export successful',
        description: `Data exported as ${filename}.csv`,
      });
    } else {
      toast({
        title: 'Export failed',
        description: 'No data to export',
        variant: 'destructive',
      });
    }
  };

  const exportToPDF = () => {
    toast({
      title: 'PDF Export',
      description: 'PDF export functionality would be implemented here',
    });
    
    // PDF export would need a library like jspdf or pdfmake
    // For the sake of the example, we'll just show a toast
  };

  const handleExport = () => {
    if (fileType === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="flex items-center gap-1"
    >
      {fileType === 'excel' ? (
        <Download className="h-4 w-4 mr-1" />
      ) : (
        <FileText className="h-4 w-4 mr-1" />
      )}
      Export {fileType.toUpperCase()}
    </Button>
  );
};

export default ExportData;
