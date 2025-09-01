
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import CreateInvoiceForm from './CreateInvoiceForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  open,
  onOpenChange
}) => {
  const queryClient = useQueryClient();
  
  const createInvoice = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: values.invoice_number,
          booking_id: values.booking_id || null,
          issue_date: values.issue_date,
          due_date: values.due_date,
          amount: values.amount,
          tax_amount: values.tax_amount,
          total_amount: values.total_amount,
          status: 'pending',
          notes: values.notes || null
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    createInvoice.mutate(values);
  };

  return (
    <FormModal
      title="Create New Invoice"
      description="Enter the details for the new invoice."
      open={open}
      onOpenChange={onOpenChange}
    >
      <CreateInvoiceForm
        onSubmit={handleSubmit}
        isSubmitting={createInvoice.isPending}
        onCancel={() => onOpenChange(false)}
      />
    </FormModal>
  );
};

export default CreateInvoiceModal;
