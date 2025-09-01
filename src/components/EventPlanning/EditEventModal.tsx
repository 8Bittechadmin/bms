
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import CreateEventForm from './CreateEventForm';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  open,
  onOpenChange,
  event
}) => {
  const queryClient = useQueryClient();
  
  // When the modal opens, refresh the clients data
  React.useEffect(() => {
    if (open && event) {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['eventTasks', event.id] });
    }
  }, [open, queryClient, event]);
  
  // Fetch tasks for this event
  const { data: tasks = [] } = useQuery({
    queryKey: ['eventTasks', event?.id],
    queryFn: async () => {
      if (!event?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('booking_id', event.id)
        .order('created_at');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!event?.id && open,
  });

  const updateEvent = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          event_name: values.event_name,
          event_type: values.event_type,
          venue_id: values.venue_id,
          client_id: values.client_id,
          start_date: values.start_date,
          end_date: values.end_date || null,
          guest_count: values.guest_count,
          notes: values.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    updateEvent.mutate(values);
  };

  if (!event) return null;

  const initialValues = {
    event_name: event.event_name,
    event_type: event.event_type,
    venue_id: event.venue_id,
    client_id: event.client_id,
    start_date: event.start_date,
    end_date: event.end_date || '',
    guest_count: event.guest_count,
    notes: event.notes || '',
  };

  return (
    <FormModal
      title="Edit Event"
      description="Update the details for this event."
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="xl"
    >
      <CreateEventForm
        onSubmit={handleSubmit}
        isSubmitting={updateEvent.isPending}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
        bookingId={event.id}
        existingTasks={tasks}
      />
    </FormModal>
  );
};

export default EditEventModal;
