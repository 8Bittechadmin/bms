
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffFormSchema, StaffFormValues, DEPARTMENT_OPTIONS, STATUS_OPTIONS } from './StaffFormSchema';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { InputField, SelectField } from '@/components/Common/FormFields';
import { DialogFooter } from '@/components/ui/dialog';

interface StaffFormProps {
  onSubmit: (values: StaffFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  defaultValues?: Partial<StaffFormValues>;
  initialData?: Partial<StaffFormValues>; // Added to support both naming conventions
}

const StaffForm: React.FC<StaffFormProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
  defaultValues,
  initialData
}) => {
  // Use initialData if provided, otherwise use defaultValues, or fallback to defaults
  const formDefaults = initialData || defaultValues || {
    name: '',
    position: '',
    department: 'Service',
    contact: '',
    status: 'available',
  };

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(StaffFormSchema),
    defaultValues: formDefaults as StaffFormValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          form={form}
          name="name"
          label="Staff Name"
          placeholder="Enter staff member's full name"
        />
        
        <InputField
          form={form}
          name="position"
          label="Position"
          placeholder="Enter staff position"
        />
        
        <SelectField
          form={form}
          name="department"
          label="Department"
          options={DEPARTMENT_OPTIONS}
        />
        
        <InputField
          form={form}
          name="contact"
          label="Contact Email"
          placeholder="Enter email address"
        />
        
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={STATUS_OPTIONS}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Staff'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default StaffForm;
