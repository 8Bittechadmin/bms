
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import StaffForm from './StaffForm';
import { StaffFormValues } from './StaffFormSchema';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: any;
  mode?: 'create' | 'edit';
  onSubmit?: (values: StaffFormValues) => Promise<any>;
}

export const StaffModal: React.FC<StaffModalProps> = ({ 
  open, 
  onOpenChange,
  staff,
  mode = 'create',
  onSubmit: externalSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();

  const createStaff = useMutation({
    mutationFn: async (values: StaffFormValues) => {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: values.name,
          position: values.position,
          department: values.department,
          contact: values.contact || null,
          status: values.status || 'available'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add staff member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateStaff = useMutation({
    mutationFn: async (values: StaffFormValues) => {
      if (!staff) throw new Error('No staff selected');
      
      const { data, error } = await supabase
        .from('staff')
        .update({
          name: values.name,
          position: values.position,
          department: values.department,
          contact: values.contact || null,
          status: values.status || 'available'
        })
        .eq('id', staff.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update staff member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteStaff = useMutation({
    mutationFn: async () => {
      if (!staff) throw new Error('No staff selected');
      
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staff.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete staff member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (values: StaffFormValues) => {
    // If external submit handler is provided, use that
    if (externalSubmit) {
      externalSubmit(values);
    } else if (mode === 'create') {
      createStaff.mutate(values);
    } else {
      updateStaff.mutate(values);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      deleteStaff.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Staff Member' : 'Edit Staff Member'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Enter the details for the new staff member. Click save when you\'re done.'
              : 'Update the staff member details or delete them.'}
          </DialogDescription>
        </DialogHeader>
        
        <StaffForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={createStaff.isPending || updateStaff.isPending}
          initialData={staff ? {
            name: staff.name,
            position: staff.position,
            department: staff.department,
            contact: staff.contact || '',
            status: staff.status || 'available'
          } : undefined}
        />

        {mode === 'edit' && (
          <div className="mt-6 border-t pt-4">
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteStaff.isPending}
              className="w-full"
            >
              {deleteStaff.isPending ? 'Deleting...' : 'Delete Staff Member'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StaffModal;
