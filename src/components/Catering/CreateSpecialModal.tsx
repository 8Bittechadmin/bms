
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SpecialMenuForm } from './SpecialMenuForm';

interface CreateSpecialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateSpecialModal: React.FC<CreateSpecialModalProps> = ({
  open,
  onOpenChange
}) => {
  const queryClient = useQueryClient();
  
  const createSpecial = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: values.name,
          description: values.description || null,
          category_id: values.category_id,
          price: values.price,
          is_special: true,
          image_url: values.image_url || null,
          ingredients: values.ingredients || null
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Special menu item has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create special menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    createSpecial.mutate(values);
  };

  return (
    <FormModal
      title="Create Special Menu Item"
      description="Enter the details for your special menu item."
      open={open}
      onOpenChange={onOpenChange}
    >
      <SpecialMenuForm
        onSubmit={handleSubmit}
        isSubmitting={createSpecial.isPending}
        onCancel={() => onOpenChange(false)}
      />
    </FormModal>
  );
};

export default CreateSpecialModal;
