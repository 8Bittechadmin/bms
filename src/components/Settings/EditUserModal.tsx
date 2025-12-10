import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import UserForm from './UserForm';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: number; username: string; role: string } | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, onOpenChange, user }) => {
  const queryClient = useQueryClient();

  const updateUser = useMutation({
    mutationFn: async (values: { username: string; role: string; password?: string }) => {
      if (!user) throw new Error('No user selected');
      const payload: any = {
        username: values.username,
        role: values.role,
      };
      // We don't update password directly in users table when using Supabase Auth.
      // If password is provided, trigger a password reset email to the user's email.
      const { data, error } = await supabase.from('users').update(payload).eq('id', user.id).select();
      if (error) throw error;
      console.debug('[EditUserModal] User updated successfully:', { userId: user.id, payload, data });

      if (values.password) {
        // Trigger password reset email for the provided username (treated as email)
        try {
          await supabase.auth.resetPasswordForEmail(values.username);
        } catch (e: any) {
          // non-fatal; notify the admin
          throw new Error(`Profile updated but failed to send reset email: ${e.message}`);
        }
      }
      return data;
    },
    onSuccess: () => {
      toast({ title: 'User updated', description: 'User details have been updated.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: `Failed to update user: ${err.message}`, variant: 'destructive' });
    }
  });

  const handleSubmit = (values: any) => updateUser.mutate(values);

  // fetch roles for select
  const rolesQuery = queryClient.getQueryData(['userRoles']) as { id: string; name: string }[] | undefined;

  return (
    <FormModal title="Edit User" description="Update user information." open={open} onOpenChange={onOpenChange}>
      <UserForm
        onSubmit={handleSubmit}
        isSubmitting={updateUser.isPending}
        onCancel={() => onOpenChange(false)}
        roles={rolesQuery || []}
        initialValues={user ? { username: user.username, role: user.role } : undefined}
      />
    </FormModal>
  );
};

export default EditUserModal;
