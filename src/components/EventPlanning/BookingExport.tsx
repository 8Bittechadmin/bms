
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  Printer, 
  Share2, 
  Copy, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BookingExportProps {
  bookings: any[];
  selectedBookingIds?: string[];
  isSelectionMode?: boolean;
}

const BookingExport: React.FC<BookingExportProps> = ({ 
  bookings, 
  selectedBookingIds = [],
  isSelectionMode = false
}) => {
  const [copied, setCopied] = useState(false);
  
  // Get the bookings to export based on selection mode and selected IDs
  const getBookingsToExport = () => {
    if (isSelectionMode && selectedBookingIds.length > 0) {
      return bookings.filter(booking => selectedBookingIds.includes(booking.id));
    }
    return bookings;
  };
  
  // Prepare CSV data
  const prepareCSVData = () => {
    const exportBookings = getBookingsToExport();
    
    if (exportBookings.length === 0) {
      toast({
        title: 'No bookings to export',
        description: 'Please select at least one booking to export.',
        variant: 'destructive',
      });
      return null;
    }

    // CSV Headers
    const headers = [
      'Event Name',
      'Event Type',
      'Venue',
      'Client',
      'Start Date',
      'End Date',
      'Guest Count',
      'Amount',
      'Status',
      'Notes'
    ].join(',');
    
    // CSV Rows
    const rows = exportBookings.map(booking => {
      const startDate = booking.start_date ? new Date(booking.start_date).toLocaleString() : 'N/A';
      const endDate = booking.end_date ? new Date(booking.end_date).toLocaleString() : 'N/A';
      
      return [
        `"${booking.event_name?.replace(/"/g, '""') || ''}"`,
        `"${booking.event_type?.replace(/"/g, '""') || ''}"`,
        `"${booking.venue?.name?.replace(/"/g, '""') || ''}"`,
        `"${(booking.client?.name || booking.wedding_bookings?.[0]?.client_name || '')?.replace(/"/g, '""')}"`,
        `"${startDate}"`,
        `"${endDate}"`,
        booking.guest_count || 0,
        booking.total_amount || 0,
        `"${booking.status?.replace(/"/g, '""') || ''}"`,
        `"${booking.notes?.replace(/"/g, '""') || ''}"`,
      ].join(',');
    });
    
    return [headers, ...rows].join('\n');
  };
  
  // Export as CSV
  const handleExportCSV = () => {
    const csvData = prepareCSVData();
    if (!csvData) return;
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `events_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export successful',
      description: `${getBookingsToExport().length} events exported to CSV.`,
    });
  };
  
  // Copy to clipboard
  const handleCopyToClipboard = () => {
    const exportBookings = getBookingsToExport();
    
    if (exportBookings.length === 0) {
      toast({
        title: 'No bookings to copy',
        description: 'Please select at least one booking to copy.',
        variant: 'destructive',
      });
      return;
    }
    
    // Format the data for clipboard
    const textData = exportBookings.map(booking => {
      const startDate = booking.start_date ? new Date(booking.start_date).toLocaleString() : 'N/A';
      const endDate = booking.end_date ? new Date(booking.end_date).toLocaleString() : 'N/A';
      const clientName = booking.client?.name || (booking.wedding_bookings?.[0]?.client_name) || 'N/A';
      
      return `Event: ${booking.event_name}
Type: ${booking.event_type}
Venue: ${booking.venue?.name || 'N/A'}
Client: ${clientName}
Date: ${startDate} to ${endDate}
Guests: ${booking.guest_count || 0}
Status: ${booking.status || 'N/A'}
${booking.notes ? `Notes: ${booking.notes}` : ''}
`;
    }).join('\n---\n\n');
    
    navigator.clipboard.writeText(textData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Copied to clipboard',
        description: `${exportBookings.length} events copied to clipboard.`,
      });
    });
  };
  
  // Print data
  const handlePrint = () => {
    const exportBookings = getBookingsToExport();
    
    if (exportBookings.length === 0) {
      toast({
        title: 'No bookings to print',
        description: 'Please select at least one booking to print.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create a printable HTML document
    const printContent = `
      <html>
        <head>
          <title>Events Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .event { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .event h2 { margin-top: 0; color: #2563eb; }
            .detail { margin: 5px 0; }
            .label { font-weight: bold; display: inline-block; width: 100px; }
            .notes { margin-top: 10px; font-style: italic; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Events Report (${new Date().toLocaleDateString()})</h1>
          
          ${exportBookings.map(booking => {
            const startDate = booking.start_date ? new Date(booking.start_date).toLocaleString() : 'N/A';
            const endDate = booking.end_date ? new Date(booking.end_date).toLocaleString() : 'N/A';
            const clientName = booking.client?.name || (booking.wedding_bookings?.[0]?.client_name) || 'N/A';
            
            return `
              <div class="event">
                <h2>${booking.event_name}</h2>
                <div class="detail"><span class="label">Type:</span> ${booking.event_type}</div>
                <div class="detail"><span class="label">Venue:</span> ${booking.venue?.name || 'N/A'}</div>
                <div class="detail"><span class="label">Client:</span> ${clientName}</div>
                <div class="detail"><span class="label">Start:</span> ${startDate}</div>
                <div class="detail"><span class="label">End:</span> ${endDate}</div>
                <div class="detail"><span class="label">Guests:</span> ${booking.guest_count || 0}</div>
                <div class="detail"><span class="label">Amount:</span> $${booking.total_amount || 0}</div>
                <div class="detail"><span class="label">Status:</span> ${booking.status || 'N/A'}</div>
                ${booking.notes ? `<div class="notes">Notes: ${booking.notes}</div>` : ''}
              </div>
            `;
          }).join('')}
          
          <div class="footer">Printed on ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print after content is loaded
      printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
      };
    } else {
      toast({
        title: 'Print blocked',
        description: 'Please allow pop-ups for printing to work.',
        variant: 'destructive',
      });
    }
  };
  
  // Share data
  const handleShare = async () => {
    const exportBookings = getBookingsToExport();
    
    if (exportBookings.length === 0) {
      toast({
        title: 'No bookings to share',
        description: 'Please select at least one booking to share.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        const csvData = prepareCSVData();
        if (!csvData) return;
        
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const file = new File([blob], `events_export_${new Date().toISOString().slice(0, 10)}.csv`, { type: 'text/csv' });
        
        await navigator.share({
          title: 'Events Export',
          text: `Events Export (${exportBookings.length} events)`,
          files: [file]
        });
        
        toast({
          title: 'Share successful',
          description: 'Events data was shared successfully.',
        });
      } catch (error) {
        console.error('Error sharing:', error);
        
        // Fallback to copy
        handleCopyToClipboard();
      }
    } else {
      // Fallback for browsers without share API
      toast({
        title: 'Share not supported',
        description: 'Your browser does not support sharing. Copying to clipboard instead.',
      });
      handleCopyToClipboard();
    }
  };
  
  // Export as PDF (simulated - actually just shows a toast)
  const handleExportPDF = () => {
    const exportBookings = getBookingsToExport();
    
    if (exportBookings.length === 0) {
      toast({
        title: 'No bookings to export',
        description: 'Please select at least one booking to export.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'PDF Export',
      description: `PDF export of ${exportBookings.length} events would be generated here.`,
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export {isSelectionMode && selectedBookingIds.length > 0 ? `(${selectedBookingIds.length})` : ''}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyToClipboard}>
          {copied ? (
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Copy to clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookingExport;
