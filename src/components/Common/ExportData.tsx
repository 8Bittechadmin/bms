
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { exportJsonToXlsx, exportJsonToPdf, exportJsonToCsv } from '@/lib/exportUtils';

interface ExportDataProps {
  data: any[];
  filename: string;
  fileType: 'excel' | 'pdf' | 'csv';
}

const ExportData: React.FC<ExportDataProps> = ({ data, filename, fileType }) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast({
        title: 'Export failed',
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (fileType === 'excel') {
        exportJsonToXlsx(data, filename);
      } else if (fileType === 'pdf') {
        exportJsonToPdf(data, filename);
      } else {
        exportJsonToCsv(data, filename);
      }

      toast({
        title: 'Export started',
        description: `Preparing ${filename}.${fileType === 'excel' ? 'xlsx' : fileType}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Export failed',
        description: 'An error occurred during export',
        variant: 'destructive',
      });
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
