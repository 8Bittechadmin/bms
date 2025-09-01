
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField, TextareaField, DateTimeField } from '@/components/Common/FormFields';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

const invoiceFormSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  booking_id: z.string().optional(),
  issue_date: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  tax_amount: z.coerce.number().min(0, "Tax amount must be a positive number").default(0),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

type CreateInvoiceFormProps = {
  onSubmit: (values: InvoiceFormValues & { total_amount: number }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  initialData?: Partial<InvoiceFormValues>;
}

export function CreateInvoiceForm({ onSubmit, isSubmitting, onCancel, initialData }: CreateInvoiceFormProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData || {
      invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      issue_date: new Date().toISOString(),
      due_date: '',
      amount: 0,
      tax_amount: 0,
      notes: '',
    },
  });
  
  const [taxRate, setTaxRate] = React.useState<number>(initialData?.tax_amount && initialData.amount ? 
    (initialData.tax_amount / initialData.amount) * 100 : 
    10); // Default 10% tax
  
  // Watch the amount field to calculate tax and total
  const amount = form.watch('amount');
  
  // Calculate tax amount based on tax rate
  React.useEffect(() => {
    if (amount) {
      const calculatedTaxAmount = amount * (taxRate / 100);
      form.setValue('tax_amount', parseFloat(calculatedTaxAmount.toFixed(2)));
    }
  }, [amount, taxRate, form]);
  
  // Fetch bookings for dropdown
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookingsList'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, event_name, client_id')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
  
  // Get client names for bookings
  const { data: clients = [] } = useQuery({
    queryKey: ['clientsList'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: bookings.length > 0,
  });
  
  const bookingOptions = bookings.map(booking => {
    const client = clients.find(c => c.id === booking.client_id);
    const clientName = client ? client.name : 'Unknown Client';
    return {
      value: booking.id,
      label: `${booking.event_name} (${clientName})`
    };
  });
  
  // Calculate total amount (including tax)
  const totalAmount = parseFloat(amount?.toString() || "0") + parseFloat((form.getValues('tax_amount') || 0).toString());
  
  // Handle form submission with total amount
  const handleSubmitWithTotal = (values: InvoiceFormValues) => {
    onSubmit({
      ...values,
      total_amount: totalAmount
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithTotal)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            form={form}
            name="invoice_number"
            label="Invoice Number"
            placeholder="e.g., INV-2025-0001"
          />
          
          <SelectField
            form={form}
            name="booking_id"
            label="Related Event (optional)"
            options={bookingOptions}
            placeholder="Select event"
          />
          
          <DateTimeField
            form={form}
            name="issue_date"
            label="Issue Date"
          />
          
          <DateTimeField
            form={form}
            name="due_date"
            label="Due Date"
          />
        </div>
        
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="font-medium">Payment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              form={form}
              name="amount"
              label="Amount"
              placeholder="0.00"
              type="number"
              step="0.01"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full"
                  min="0"
                  step="0.1"
                />
                <span>%</span>
              </div>
            </div>
            
            <InputField
              form={form}
              name="tax_amount"
              label="Tax Amount"
              placeholder="0.00"
              type="number"
              step="0.01"
              readOnly={true}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount</label>
              <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-gray-50">
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <TextareaField
          form={form}
          name="notes"
          label="Notes (optional)"
          placeholder="Enter any additional notes for this invoice"
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateInvoiceForm;
