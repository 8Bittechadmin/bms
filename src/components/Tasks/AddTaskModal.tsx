
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AddTaskForm, TaskFormValues } from './AddTaskForm';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId?: string;
}

export function AddTaskModal({ open, onOpenChange, bookingId }: AddTaskModalProps) {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      // Convert Date object to ISO string if it exists, handle string dates
      let due_date = null;
      if (values.due_date) {
        if (values.due_date instanceof Date) {
          due_date = values.due_date.toISOString();
        } else if (typeof values.due_date === 'string') {
          due_date = new Date(values.due_date).toISOString();
        }
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: values.title,
          description: values.description || null,
          booking_id: values.booking_id || null,
          due_date: due_date,
          assigned_to: values.assigned_to || null,
          status: values.status,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Task created',
        description: 'The task has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create task: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: TaskFormValues) {
    createTask.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for your team to complete.
          </DialogDescription>
        </DialogHeader>
        <AddTaskForm 
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={createTask.isPending}
          bookingId={bookingId}
        />
      </DialogContent>
    </Dialog>
  );
}
