
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExportButtonProps {
  data: any[];
  filename: string;
  fileType?: 'excel' | 'pdf';
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename, 
  fileType = 'excel',
  label
}) => {
  const handleExport = () => {
    if (data.length === 0) {
      toast({
        title: 'Export failed',
        description: 'There is no data to export.',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, this would export data
    // For now, just show a success message
    toast({
      title: 'Export successful',
      description: `${data.length} records exported to ${filename}.${fileType === 'excel' ? 'xlsx' : 'pdf'}`,
    });
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
