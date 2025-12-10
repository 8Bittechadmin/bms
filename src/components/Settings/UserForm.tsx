import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField } from '@/components/Common/FormFields';

const userFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.string().min(1, 'Role is required'),
  password: z.string().min(0).optional().nullable(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (values: UserFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  roles: { id: string; name: string }[];
  initialValues?: Partial<UserFormValues>;
}

export function UserForm({ onSubmit, isSubmitting, onCancel, roles, initialValues }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: initialValues?.username || '',
      role: initialValues?.role || (roles?.[0]?.name || ''),
      password: '',
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField form={form} name="username" label="Username" placeholder="jsmith" />

        <SelectField
          form={form}
          name="role"
          label="Role"
          options={roles.map(r => ({ label: r.name, value: r.name }))}
        />

        <InputField form={form} name="password" label="Password" type="password" placeholder={initialValues ? "Leave blank to keep current password" : "Enter password"} />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : initialValues ? 'Update User' : 'Create User'}</Button>
        </div>
      </form>
    </Form>
  );
}

export default UserForm;
