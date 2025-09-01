
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField, DateTimeField, TextareaField } from '@/components/Common/FormFields';
import { taskFormSchema, TaskFormSchemaType } from './TaskFormSchema';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Export this type so it can be used in AddTaskModal
export type TaskFormValues = TaskFormSchemaType;

type AddTaskFormProps = {
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  bookingId?: string;
}

export function AddTaskForm({ onSubmit, onCancel, isSubmitting, bookingId }: AddTaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      booking_id: bookingId || null,
      due_date: null,
      assigned_to: null,
    },
  });

  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, position')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: process.env.NODE_ENV !== 'development' // Only fetch in production
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookingsSimple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, event_name')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !bookingId && process.env.NODE_ENV !== 'development', // Only fetch if no bookingId and in production
  });

  const staffOptions = staff?.map(s => ({
    value: s.id,
    label: `${s.name} (${s.position})`
  })) || [];

  const bookingOptions = bookings?.map(b => ({
    value: b.id,
    label: b.event_name
  })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          form={form}
          name="title"
          label="Task Title"
          placeholder="Enter task title"
        />
        
        <TextareaField
          form={form}
          name="description"
          label="Description"
          placeholder="Enter task description"
        />
        
        <DateTimeField
          form={form}
          name="due_date"
          label="Due Date"
        />
        
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        
        <SelectField
          form={form}
          name="assigned_to"
          label="Assigned To"
          options={staffOptions}
          placeholder="Select staff member"
        />
        
        {!bookingId && (
          <SelectField
            form={form}
            name="booking_id"
            label="Related Event"
            options={bookingOptions}
            placeholder="Select event (optional)"
          />
        )}
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              form.reset();
              if (onCancel) onCancel();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AddTaskForm;
