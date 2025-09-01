
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField, TextareaField } from '@/components/Common/FormFields';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const specialMenuFormSchema = z.object({
  name: z.string().min(1, "Menu item name is required"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be a positive number"),
  image_url: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
});

type SpecialMenuFormValues = z.infer<typeof specialMenuFormSchema>;

interface SpecialMenuFormProps {
  onSubmit: (values: SpecialMenuFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: Partial<SpecialMenuFormValues>;
}

export function SpecialMenuForm({ onSubmit, isSubmitting, onCancel, initialValues }: SpecialMenuFormProps) {
  const [ingredientsText, setIngredientsText] = React.useState('');
  
  const form = useForm<SpecialMenuFormValues>({
    resolver: zodResolver(specialMenuFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      category_id: initialValues?.category_id || '',
      price: initialValues?.price || 0,
      image_url: initialValues?.image_url || '',
      ingredients: initialValues?.ingredients || [],
    },
  });

  React.useEffect(() => {
    // Initialize ingredients text from array if available
    if (initialValues?.ingredients && initialValues.ingredients.length > 0) {
      setIngredientsText(initialValues.ingredients.join(', '));
    }
  }, [initialValues]);

  const handleFormSubmit = (values: SpecialMenuFormValues) => {
    // Parse ingredients from text to array
    const ingredientsArray = ingredientsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    onSubmit({
      ...values,
      ingredients: ingredientsArray,
      // Ensure price is a number
      price: Number(values.price)
    });
  };

  // Fetch menu categories for the dropdown
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['menuCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <InputField
          form={form}
          name="name"
          label="Menu Item Name"
          placeholder="Enter menu item name"
        />
        
        <TextareaField
          form={form}
          name="description"
          label="Description"
          placeholder="Enter menu item description"
        />
        
        <SelectField
          form={form}
          name="category_id"
          label="Category"
          options={categoryOptions}
          placeholder={loadingCategories ? "Loading categories..." : "Select category"}
        />
        
        <InputField
          form={form}
          name="price"
          label="Price"
          type="number"
          placeholder="0.00"
          onValueChange={(value) => {
            form.setValue('price', Number(value) || 0);
          }}
        />
        
        <InputField
          form={form}
          name="image_url"
          label="Image URL (optional)"
          placeholder="Enter image URL"
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Ingredients (comma separated)</label>
          <textarea
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Enter ingredients separated by commas"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialValues ? 'Update Special Item' : 'Create Special Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SpecialMenuForm;
