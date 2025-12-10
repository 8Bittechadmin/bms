
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
    onMutate: async (values: any) => {
      // Cancel any outgoing queries for dashboardStats
      await queryClient.cancelQueries({ queryKey: ['dashboardStats'] });
      
      // Get current dashboardStats
      const previousStats = queryClient.getQueryData(['dashboardStats']) as any;
      
      if (previousStats) {
        // Check if event is this month
        const eventDate = new Date(values.start_date);
        const now = new Date();
        const isThisMonth = eventDate.getMonth() === now.getMonth() && 
                           eventDate.getFullYear() === now.getFullYear();
        
        // Check if event is today
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isToday = eventDateOnly.getTime() === todayOnly.getTime();
        
        // Optimistically update stats
        const updatedStats = {
          ...previousStats,
          bookings_this_month: isThisMonth ? (previousStats.bookings_this_month || 0) + 1 : previousStats.bookings_this_month,
          total_guests_today: isToday ? (previousStats.total_guests_today || 0) + (values.guest_count || 0) : previousStats.total_guests_today,
        };
        
        queryClient.setQueryData(['dashboardStats'], updatedStats);
      }
      
      return { previousStats };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      onOpenChange(false);
    },
    onError: (error: any, variables, context: any) => {
      // Restore previous stats on error
      if (context?.previousStats) {
        queryClient.setQueryData(['dashboardStats'], context.previousStats);
      }
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
