import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, TextareaField } from '@/components/Common/FormFields';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  permissions: z.string().optional(),
  accessible_pages: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  onSubmit: (values: RoleFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: Partial<RoleFormValues>;
}

export function RoleForm({ onSubmit, isSubmitting, onCancel, initialValues }: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      permissions: initialValues?.permissions || '',
      accessible_pages: initialValues?.accessible_pages || '',
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField form={form} name="name" label="Role Name" placeholder="Manager" />

        <TextareaField
          form={form}
          name="permissions"
          label="Permissions (JSON)"
          placeholder='e.g. {"bookings": true, "venues": false}'
        />

        <InputField form={form} name="accessible_pages" label="Accessible Pages (comma separated)" placeholder="dashboard,bookings,venues" />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Role'}</Button>
        </div>
      </form>
    </Form>
  );
}

export default RoleForm;
