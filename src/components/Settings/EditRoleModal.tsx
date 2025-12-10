import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import RoleForm from './RoleForm';

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: { id: string; name: string; permissions?: any; accessible_pages?: string[] } | null;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ open, onOpenChange, role }) => {
  const queryClient = useQueryClient();

  const updateRole = useMutation({
    mutationFn: async (values: { name: string; permissions?: string; accessible_pages?: string }) => {
      if (!role) throw new Error('No role selected');
      let perms: any = {};
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

      const { data, error } = await supabase.from('user_roles').update({
        name: values.name,
        permissions: perms,
        accessible_pages: pages,
      }).eq('id', role.id).select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Role updated', description: 'Role has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: `Failed to update role: ${err.message}`, variant: 'destructive' });
    }
  });

  const handleSubmit = (values: any) => updateRole.mutate(values);

  return (
    <FormModal title="Edit Role" description="Update role details." open={open} onOpenChange={onOpenChange}>
      <RoleForm
        onSubmit={handleSubmit}
        isSubmitting={updateRole.isPending}
        onCancel={() => onOpenChange(false)}
        initialValues={role ? {
          name: role.name,
          permissions: role.permissions ? JSON.stringify(role.permissions) : '',
          accessible_pages: role.accessible_pages || [],
        } : undefined}
      />
    </FormModal>
  );
};

export default EditRoleModal;
