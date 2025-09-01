
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import VendorForm, { VendorFormValues } from './VendorForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  name: string;
  type: string;
  contact_name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor;
}

const VendorModal: React.FC<VendorModalProps> = ({
  open,
  onOpenChange,
  vendor
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!vendor;
  
  const mutation = useMutation({
    mutationFn: async (values: VendorFormValues) => {
      if (isEditing) {
        // For now, just show a toast since vendors table doesn't exist
        toast({
          title: "Feature Coming Soon",
          description: "Vendor editing functionality will be available soon.",
        });
        return null;
      } else {
        // For now, just show a toast since vendors table doesn't exist
        toast({
          title: "Feature Coming Soon",
          description: "Vendor creation functionality will be available soon.",
        });
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} vendor: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: VendorFormValues) => {
    mutation.mutate(values);
  };

  const initialValues = isEditing ? {
    name: vendor.name,
    type: vendor.type,
    contact_name: vendor.contact_name,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address || '',
    notes: vendor.notes || '',
  } : undefined;

  return (
    <FormModal
      title={isEditing ? "Edit Vendor" : "Add New Vendor"}
      description={isEditing ? "Update vendor details." : "Add a new vendor to your roster."}
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="lg"
    >
      <VendorForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </FormModal>
  );
};

export default VendorModal;
