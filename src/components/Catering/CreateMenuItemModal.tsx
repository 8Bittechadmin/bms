
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import CreateMenuItemForm from './CreateMenuItemForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateMenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateMenuItemModal: React.FC<CreateMenuItemModalProps> = ({
  open,
  onOpenChange
}) => {
  const queryClient = useQueryClient();
  
  const createMenuItem = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: values.name,
          description: values.description || null,
          category_id: values.category_id,
          price: values.price,
          is_special: values.is_special,
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
        description: "Menu item has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    createMenuItem.mutate(values);
  };

  return (
    <FormModal
      title="Create Menu Item"
      description="Enter the details for your new menu item."
      open={open}
      onOpenChange={onOpenChange}
    >
      <CreateMenuItemForm
        onSubmit={handleSubmit}
        isSubmitting={createMenuItem.isPending}
        onCancel={() => onOpenChange(false)}
      />
    </FormModal>
  );
};

export default CreateMenuItemModal;
