
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { exportJsonToXlsx, exportJsonToPdf, exportJsonToCsv } from '@/lib/exportUtils';

interface ExportButtonProps {
  data: any[];
  filename: string;
  fileType?: 'excel' | 'pdf' | 'csv';
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename, 
  fileType = 'excel',
  label
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast({
        title: 'Export failed',
        description: 'There is no data to export.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (fileType === 'excel') exportJsonToXlsx(data, filename);
      else if (fileType === 'pdf') exportJsonToPdf(data, filename);
      else exportJsonToCsv(data, filename);

      toast({
        title: 'Export started',
        description: `${data.length} records being exported to ${filename}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting data',
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
      {label || `Export ${fileType.toUpperCase()}`}
    </Button>
  );
};

export default ExportButton;
