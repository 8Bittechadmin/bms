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
      // Create auth user via Supabase Auth (client signUp). Username is treated as email here.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.username,
        password: values.password,
      });
      if (signUpError) throw signUpError;

      const authUserId = (signUpData as any)?.user?.id || null;

      // Insert profile into local `users` table (do not store password). If the
      // `auth_user_id` column exists, populate it so we can reliably link profiles
      // to Auth users.
      const insertPayload: any = {
        username: values.username,
        role: values.role,
        password: null,
      };
      if (authUserId) insertPayload.auth_user_id = authUserId;

      const { data, error } = await supabase.from('users').insert(insertPayload).select();

      if (error) throw error;
      console.debug('[AddUserModal] User inserted successfully:', { authUserId, profile: data });
      return { auth: signUpData, profile: data };
    },
    onSuccess: () => {
      toast({ title: 'User created', description: 'New user has been added and signup email sent.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
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
