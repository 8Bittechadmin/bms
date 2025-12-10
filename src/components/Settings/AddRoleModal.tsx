import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import RoleForm from './RoleForm';

interface AddRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();

  const createRole = useMutation({
    mutationFn: async (values: { name: string; permissions?: string; accessible_pages?: string }) => {
      // parse permissions JSON if provided
      let perms: any = null;
      if (values.permissions) {
        try {
          perms = JSON.parse(values.permissions);
        } catch (e) {
          throw new Error('Permissions must be valid JSON');
        }
      }

      const pages = values.accessible_pages
        ? values.accessible_pages.split(',').map(p => p.trim()).filter(Boolean)
        : [];

      const { data, error } = await supabase.from('user_roles').insert({
        name: values.name,
        permissions: perms || {},
        accessible_pages: pages,
      }).select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Role created', description: 'New role has been added.' });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: `Failed to create role: ${err.message}`, variant: 'destructive' });
    }
  });

  const handleSubmit = (values: any) => createRole.mutate(values);

  return (
    <FormModal title="Add Role" description="Create a new user role." open={open} onOpenChange={onOpenChange}>
      <RoleForm onSubmit={handleSubmit} isSubmitting={createRole.isPending} onCancel={() => onOpenChange(false)} />
    </FormModal>
  );
};

export default AddRoleModal;
