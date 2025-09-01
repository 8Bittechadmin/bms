import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface InventoryItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  open,
  onOpenChange,
  item
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      category: 'furniture',
      quantity: 0,
      unit: 'piece',
      status: 'in-stock',
      notes: '',
    }
  });
  
  // Reset form when item changes or modal opens
  useEffect(() => {
    if (item && open) {
      reset({
        name: item.name || '',
        category: item.category || 'furniture',
        quantity: item.quantity || 0,
        unit: item.unit || 'piece',
        status: item.status || 'in-stock',
        notes: item.notes || '',
      });
    }
  }, [item, open, reset]);
  
  const updateItem = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('inventory')
        .update({
          name: values.name,
          category: values.category,
          quantity: values.quantity,
          unit: values.unit,
          status: values.status,
          notes: values.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Item Updated',
        description: 'The inventory item has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item',
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    updateItem.mutate(values);
  };
  
  const categoryOptions = [
    { value: 'furniture', label: 'Furniture' },
    { value: 'linens', label: 'Linens' },
    { value: 'av-equipment', label: 'AV Equipment' },
    { value: 'tableware', label: 'Tableware' },
    { value: 'decor', label: 'Decor' }
  ];
  
  const statusOptions = [
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low', label: 'Low Stock' },
    { value: 'out', label: 'Out of Stock' },
    { value: 'on-order', label: 'On Order' }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogClose className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogDescription>
            Update the details for this inventory item.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter item name"
              {...register("name", { required: "Item name is required" })}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message as string}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                {...register("quantity", { valueAsNumber: true })}
              />
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                type="text"
                placeholder="piece, box, etc."
                {...register("unit")}
              />
            </div>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes"
              className="min-h-[100px]"
              {...register("notes")}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemModal;
