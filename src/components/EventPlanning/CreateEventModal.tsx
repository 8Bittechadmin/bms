
import React from 'react';
import FormModal from '@/components/Common/FormModal';
import CreateEventForm from './CreateEventForm';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  open,
  onOpenChange
}) => {
  const queryClient = useQueryClient();
  
  // When the modal opens, refresh the clients data
  React.useEffect(() => {
    if (open) {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  }, [open, queryClient]);
  
  const createEvent = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('bookings') // We use bookings table since events are stored as bookings
        .insert({
          event_name: values.event_name,
          event_type: values.event_type,
          venue_id: values.venue_id,
          client_id: values.client_id,
          start_date: values.start_date,
          end_date: values.end_date || null,
          guest_count: values.guest_count,
          status: 'pending',
          notes: values.notes || null
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    createEvent.mutate(values);
  };

  return (
    <FormModal
      title="Create New Event"
      description="Enter the details for your new event."
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="lg"
    >
      <CreateEventForm
        onSubmit={handleSubmit}
        isSubmitting={createEvent.isPending}
        onCancel={() => onOpenChange(false)}
      />
    </FormModal>
  );
};

export default CreateEventModal;
