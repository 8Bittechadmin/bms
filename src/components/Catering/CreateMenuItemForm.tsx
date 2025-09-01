
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField, TextareaField, CheckboxField } from '@/components/Common/FormFields';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const menuItemFormSchema = z.object({
  name: z.string().min(1, "Menu item name is required"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  is_special: z.boolean().default(false),
  image_url: z.string().optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

type CreateMenuItemFormProps = {
  onSubmit: (values: MenuItemFormValues & { ingredients?: string[] }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CreateMenuItemForm({ onSubmit, isSubmitting, onCancel }: CreateMenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      price: 0,
      is_special: false,
      image_url: '',
    },
  });
  
  const [ingredients, setIngredients] = React.useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = React.useState('');
  
  // Fetch menu categories
  const { data: categories = [] } = useQuery({
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
  
  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };
  
  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };
  
  const handleSubmitWithIngredients = (values: MenuItemFormValues) => {
    onSubmit({
      ...values,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithIngredients)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            form={form}
            name="name"
            label="Menu Item Name"
            placeholder="Enter menu item name"
          />
          
          <SelectField
            form={form}
            name="category_id"
            label="Category"
            options={categoryOptions}
            placeholder="Select category"
          />
          
          <InputField
            form={form}
            name="price"
            label="Price"
            placeholder="0.00"
            type="number"
            step="0.01"
          />
          
          <div className="flex flex-col space-y-2">
            <CheckboxField
              form={form}
              name="is_special"
              label="Mark as Special Item"
            />
          </div>
        </div>
        
        <TextareaField
          form={form}
          name="description"
          label="Description"
          placeholder="Enter menu item description"
        />
        
        <InputField
          form={form}
          name="image_url"
          label="Image URL (optional)"
          placeholder="https://example.com/image.jpg"
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Ingredients</label>
          <div className="flex gap-2">
            <Input 
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              placeholder="Add an ingredient"
              className="flex-grow"
            />
            <Button type="button" onClick={addIngredient} size="sm">
              Add
            </Button>
          </div>
          
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                  {ingredient}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeIngredient(ingredient)}
                  />
                </Badge>
              ))}
            </div>
          )}
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
            {isSubmitting ? 'Saving...' : 'Create Menu Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateMenuItemForm;
