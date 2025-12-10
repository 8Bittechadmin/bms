import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import UserForm from './UserForm';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();

  const { data: roles } = useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('id,name');
      if (error) throw error;
      return data as { id: string; name: string }[];
    }
  });

  const createUser = useMutation({
    mutationFn: async (values: { username: string; role: string; password: string }) => {
      console.debug('[AddUserModal] Creating user with values:', values);
      
      // Insert directly into users table (no Supabase Auth needed)
      const { data, error } = await supabase.from('users').insert({
        username: values.username,
        role: values.role,
        password: values.password,
      }).select();

      if (error) {
        console.error('[AddUserModal] Insert error:', error);
        throw error;
      }
      
      console.debug('[AddUserModal] User inserted successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'User created', description: 'New user has been added successfully.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      console.error('[AddUserModal] Error creating user:', err);
      console.error('[AddUserModal] Full error details:', JSON.stringify(err, null, 2));
      toast({ title: 'Error', description: `Failed to create user: ${err.message}`, variant: 'destructive' });
    }
  });

  const handleSubmit = (values: any) => createUser.mutate(values);

  return (
    <FormModal title="Add User" description="Create a new user account." open={open} onOpenChange={onOpenChange}>
      <UserForm onSubmit={handleSubmit} isSubmitting={createUser.isPending} onCancel={() => onOpenChange(false)} roles={roles || []} />
    </FormModal>
  );
};

export default AddUserModal;
