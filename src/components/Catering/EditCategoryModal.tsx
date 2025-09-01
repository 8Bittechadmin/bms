
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CategoryForm } from './CategoryForm';
import { Button } from '@/components/ui/button'; // Added missing Button import

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  open,
  onOpenChange,
  category
}) => {
  const queryClient = useQueryClient();

  const updateCategory = useMutation({
    mutationFn: async (values: { name: string; description?: string }) => {
      if (!category) throw new Error('No category selected');
      
      const { data, error } = await supabase
        .from('menu_categories')
        .update({
          name: values.name,
          description: values.description || null
        })
        .eq('id', category.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu category has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update menu category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async () => {
      if (!category) throw new Error('No category selected');
      
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Menu category has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete menu category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    updateCategory.mutate(values);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategory.mutate();
    }
  };

  return (
    <FormModal
      title="Edit Menu Category"
      description="Update the category details or delete it."
      open={open}
      onOpenChange={onOpenChange}
    >
      {category && (
        <>
          <CategoryForm
            onSubmit={handleSubmit}
            isSubmitting={updateCategory.isPending}
            onCancel={() => onOpenChange(false)}
            initialValues={{
              name: category.name,
              description: category.description || ''
            }}
          />
          <div className="mt-6 border-t pt-4">
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              className="w-full"
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete Category'}
            </Button>
          </div>
        </>
      )}
    </FormModal>
  );
};

export default EditCategoryModal;
