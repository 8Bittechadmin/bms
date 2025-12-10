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
      
      console.debug('[EditUserModal] Updating user:', { userId: user.id, values });
      
      const payload: any = {
        username: values.username,
        role: values.role,
      };
      
      // If password is provided, update it as well
      if (values.password && values.password.trim()) {
        payload.password = values.password;
      }

      const { data, error } = await supabase.from('users').update(payload).eq('id', user.id).select();
      if (error) {
        console.error('[EditUserModal] Update error:', error);
        throw error;
      }
      console.debug('[EditUserModal] User updated successfully:', { userId: user.id, payload, data });
      return data;
    },
    onSuccess: () => {
      toast({ title: 'User updated', description: 'User details have been updated.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      console.error('[EditUserModal] Error:', err);
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
