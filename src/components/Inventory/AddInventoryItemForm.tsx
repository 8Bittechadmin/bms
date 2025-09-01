
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField, TextareaField } from '@/components/Common/FormFields';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  min_quantity: z.coerce.number().min(0, "Minimum quantity must be a positive number"),
  unit: z.string().optional(),
  status: z.string().default('in-stock'),
  notes: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

type AddInventoryItemFormProps = {
  onSubmit: (values: InventoryFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const categoryOptions = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'av-equipment', label: 'AV Equipment' },
  { value: 'tableware', label: 'Tableware' },
  { value: 'linens', label: 'Linens' },
  { value: 'decor', label: 'Decor' },
  { value: 'kitchen', label: 'Kitchen Equipment' },
];

const statusOptions = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
  { value: 'on-order', label: 'On Order' },
];

export function AddInventoryItemForm({ onSubmit, isSubmitting, onCancel }: AddInventoryItemFormProps) {
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: '',
      category: '',
      quantity: 0,
      min_quantity: 0,
      unit: '',
      status: 'in-stock',
      notes: ''
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            form={form}
            name="name"
            label="Item Name"
            placeholder="Enter item name"
          />
          
          <SelectField
            form={form}
            name="category"
            label="Category"
            options={categoryOptions}
            placeholder="Select category"
          />
          
          <InputField
            form={form}
            name="quantity"
            label="Quantity"
            placeholder="0"
            type="number"
          />
          
          <InputField
            form={form}
            name="min_quantity"
            label="Minimum Quantity"
            placeholder="0"
            type="number"
          />
          
          <InputField
            form={form}
            name="unit"
            label="Unit (optional)"
            placeholder="e.g., pieces, sets, packs"
          />
          
          <SelectField
            form={form}
            name="status"
            label="Status"
            options={statusOptions}
          />
        </div>
        
        <TextareaField
          form={form}
          name="notes"
          label="Notes (optional)"
          placeholder="Any additional information about this item"
        />
        
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
            {isSubmitting ? 'Saving...' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AddInventoryItemForm;
