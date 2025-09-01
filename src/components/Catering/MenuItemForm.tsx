
import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FormModal from '@/components/Common/FormModal';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  is_special: z.boolean().default(false),
  ingredients: z.array(z.string()).optional(),
  image_url: z.string().optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MenuItemFormValues;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  open,
  onOpenChange,
  initialData,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      category_id: '',
      price: 0,
      is_special: false,
      ingredients: [],
      image_url: '',
    },
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  const createMenuItem = useMutation({
    mutationFn: async (values: MenuItemFormValues) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: values.name,
          description: values.description || null,
          category_id: values.category_id,
          price: values.price,
          is_special: values.is_special,
          ingredients: values.ingredients || [],
          image_url: values.image_url || null,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Menu item has been created.',
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create menu item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: async (values: MenuItemFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          name: values.name,
          description: values.description || null,
          category_id: values.category_id,
          price: values.price,
          is_special: values.is_special,
          ingredients: values.ingredients || [],
          image_url: values.image_url || null,
        })
        .eq('id', values.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Menu item has been updated.',
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update menu item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: MenuItemFormValues) {
    if (isEditing && initialData) {
      updateMenuItem.mutate({ ...values, id: (initialData as any).id });
    } else {
      createMenuItem.mutate(values);
    }
  }

  return (
    <FormModal
      title={isEditing ? "Edit Menu Item" : "Add Menu Item"}
      description="Create a new menu item with details and pricing."
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter menu item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingCategories ? (
                      <SelectItem value="" disabled>Loading categories...</SelectItem>
                    ) : (
                      categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter item description" 
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter image URL" 
                    {...field}
                    value={field.value || ''}  
                  />
                </FormControl>
                <FormDescription>
                  URL for the menu item image
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_special"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Mark as Special
                  </FormLabel>
                  <FormDescription>
                    This will highlight the item as a special on the menu
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createMenuItem.isPending || updateMenuItem.isPending}
            >
              {isEditing ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
};

export default MenuItemForm;
