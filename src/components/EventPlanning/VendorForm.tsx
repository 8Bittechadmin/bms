
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField, TextareaField } from '@/components/Common/FormFields';

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  type: z.string().min(1, "Vendor type is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  onSubmit: (values: VendorFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: Partial<VendorFormValues>;
}

const vendorTypes = [
  { value: 'caterer', label: 'Caterer' },
  { value: 'florist', label: 'Florist' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'dj', label: 'DJ/Entertainment' },
  { value: 'decorator', label: 'Decorator' },
  { value: 'rental', label: 'Rental Company' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

const VendorForm: React.FC<VendorFormProps> = ({ onSubmit, isSubmitting, onCancel, initialValues }) => {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialValues || {
      name: '',
      type: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          form={form}
          name="name"
          label="Vendor Name"
          placeholder="Enter vendor company name"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            form={form}
            name="type"
            label="Vendor Type"
            options={vendorTypes}
            placeholder="Select vendor type"
          />
          
          <InputField
            form={form}
            name="contact_name"
            label="Contact Person"
            placeholder="Primary contact name"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            form={form}
            name="email"
            label="Email"
            placeholder="Contact email"
            type="email"
          />
          
          <InputField
            form={form}
            name="phone"
            label="Phone"
            placeholder="Contact phone number"
          />
        </div>
        
        <InputField
          form={form}
          name="address"
          label="Address (Optional)"
          placeholder="Business address"
        />
        
        <TextareaField
          form={form}
          name="notes"
          label="Notes (Optional)"
          placeholder="Additional notes about this vendor"
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
            {isSubmitting ? (initialValues ? 'Updating...' : 'Adding...') : (initialValues ? 'Update Vendor' : 'Add Vendor')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VendorForm;
