
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CategoryForm } from './CategoryForm';

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  open,
  onOpenChange
}) => {
  const queryClient = useQueryClient();
  
  const createCategory = useMutation({
    mutationFn: async (values: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          name: values.name,
          description: values.description || null
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu category has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create menu category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    createCategory.mutate(values);
  };

  return (
    <FormModal
      title="Create Menu Category"
      description="Enter the name and description for the new menu category."
      open={open}
      onOpenChange={onOpenChange}
    >
      <CategoryForm
        onSubmit={handleSubmit}
        isSubmitting={createCategory.isPending}
        onCancel={() => onOpenChange(false)}
      />
    </FormModal>
  );
};

export default CreateCategoryModal;
