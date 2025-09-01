
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CreateInvoiceForm from './CreateInvoiceForm';
import { Button } from '@/components/ui/button';

interface EditInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any | null;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  open,
  onOpenChange,
  invoice
}) => {
  const queryClient = useQueryClient();
  
  const updateInvoice = useMutation({
    mutationFn: async (values: any) => {
      if (!invoice) throw new Error('No invoice selected');
      
      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_number: values.invoice_number,
          booking_id: values.booking_id || null,
          issue_date: values.issue_date,
          due_date: values.due_date,
          amount: values.amount,
          tax_amount: values.tax_amount,
          total_amount: values.total_amount,
          notes: values.notes || null
        })
        .eq('id', invoice.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async () => {
      if (!invoice) throw new Error('No invoice selected');
      
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    updateInvoice.mutate(values);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteInvoice.mutate();
    }
  };

  return (
    <FormModal
      title="Edit Invoice"
      description="Update the invoice details or delete it."
      open={open}
      onOpenChange={onOpenChange}
    >
      {invoice && (
        <>
          <CreateInvoiceForm
            onSubmit={handleSubmit}
            isSubmitting={updateInvoice.isPending}
            onCancel={() => onOpenChange(false)}
            initialData={{
              invoice_number: invoice.invoice_number,
              booking_id: invoice.booking_id || '',
              issue_date: invoice.issue_date || '',
              due_date: invoice.due_date,
              amount: invoice.amount,
              tax_amount: invoice.tax_amount || 0,
              notes: invoice.notes || '',
            }}
          />
          <div className="mt-6 border-t pt-4">
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInvoice.isPending}
              className="w-full"
            >
              {deleteInvoice.isPending ? 'Deleting...' : 'Delete Invoice'}
            </Button>
          </div>
        </>
      )}
    </FormModal>
  );
};

export default EditInvoiceModal;
