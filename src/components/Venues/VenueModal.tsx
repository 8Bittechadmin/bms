
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import VenueForm from './VenueForm';
import { VenueFormValues } from './VenueFormSchema';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface VenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue?: any; // For editing existing venues
  isEditing?: boolean;
}

export const VenueModal: React.FC<VenueModalProps> = ({ 
  open, 
  onOpenChange, 
  venue = null,
  isEditing = false 
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();

  const venueSubmitMutation = useMutation({
    mutationFn: async (values: VenueFormValues) => {
      // Check if venue has active bookings to determine availability
      let availability = values.availability;
      
      if (isEditing && venue) {
        // Check for active bookings if trying to set as available
        if (values.availability === 'available') {
          const now = new Date().toISOString();
          const { data: activeBookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('venue_id', venue.id)
            .gt('end_date', now)
            .eq('status', 'confirmed')
            .limit(1);
          
          if (activeBookings && activeBookings.length > 0) {
            // If there are active bookings, override availability
            availability = 'booked';
          }
        }
        
        // Update existing venue
        const { error } = await supabase
          .from('venues')
          .update({
            name: values.name,
            description: values.description || null,
            capacity: values.capacity,
            square_footage: values.square_footage,
            total_amount: values.total_amount,
            deposit_amount: values.deposit_amount,
            full_day_amount: values.full_day_amount,
            half_day_amount: values.half_day_amount,
            hourly_rate: values.total_amount || 0,
            location: values.location,
            availability: availability,
            images: values.images || [],
            features: values.features || [],
            updated_at: new Date().toISOString(),
          })
          .eq('id', venue.id) as any;
        
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['venue', venue.id] });
      } else {
        // Insert new venue
        const { error } = await supabase
          .from('venues')
          .insert({
            name: values.name,
            description: values.description || null,
            capacity: values.capacity,
            square_footage: values.square_footage,
            total_amount: values.total_amount,
            deposit_amount: values.deposit_amount,
            full_day_amount: values.full_day_amount,
            half_day_amount: values.half_day_amount,
            hourly_rate: values.total_amount || 0,
            location: values.location,
            availability: availability,
            images: values.images || [],
            features: values.features || []
          }) as any;
        
        if (error) throw error;
      }
      
      return { isEditing, availability };
    },
    onMutate: async (values: VenueFormValues) => {
      // Cancel outgoing dashboardStats queries
      await queryClient.cancelQueries({ queryKey: ['dashboardStats'] });
      
      // Get current dashboardStats
      const previousStats = queryClient.getQueryData(['dashboardStats']) as any;
      
      if (previousStats) {
        let activeVenuesDiff = 0;
        
        if (isEditing && venue) {
          // Check if availability status changed to affect active_venues count
          const oldIsAvailable = venue.availability === 'available';
          const newIsAvailable = values.availability === 'available';
          
          if (oldIsAvailable && !newIsAvailable) {
            activeVenuesDiff = -1; // Was available, now not
          } else if (!oldIsAvailable && newIsAvailable) {
            activeVenuesDiff = 1; // Wasn't available, now is
          }
        } else {
          // New venue: if it's available, increment active venues
          if (values.availability === 'available') {
            activeVenuesDiff = 1;
          }
        }
        
        // Optimistically update stats
        const updatedStats = {
          ...previousStats,
          active_venues: Math.max(0, (previousStats.active_venues || 0) + activeVenuesDiff),
        };
        
        queryClient.setQueryData(['dashboardStats'], updatedStats);
      }
      
      return { previousStats };
    },
    onSuccess: (result) => {
      const action = result.isEditing ? 'updated' : 'added';
      const title = result.isEditing ? 'Venue Updated' : 'Venue Added';
      
      if (result.isEditing && result.availability === 'booked') {
        toast({
          title: "Availability Adjusted",
          description: "This venue has active bookings, so it's been marked as 'Booked'.",
        });
      }
      
      toast({
        title,
        description: `The venue has been successfully ${action}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      onOpenChange(false);
    },
    onError: (error: any, variables, context: any) => {
      // Restore previous stats on error
      if (context?.previousStats) {
        queryClient.setQueryData(['dashboardStats'], context.previousStats);
      }
      console.error('Error saving venue:', error);
      toast({
        title: 'Error',
        description: error.message || 'There was a problem saving the venue.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (values: VenueFormValues) => {
    setIsSubmitting(true);
    try {
      await venueSubmitMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Venue' : 'Add New Venue'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the venue details. Click save when you\'re done.'
              : 'Enter the details for the new venue. Click save when you\'re done.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <VenueForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          defaultValues={isEditing && venue ? {
            name: venue.name,
            capacity: venue.capacity,
            square_footage: venue.square_footage,
            total_amount: venue.total_amount || 0,
            deposit_amount: venue.deposit_amount || 0,
            full_day_amount: venue.full_day_amount || 0,
            half_day_amount: venue.half_day_amount || 0,
            description: venue.description || '',
            location: venue.location || '',
            availability: venue.availability || 'available',
            images: venue.images || [],
            features: venue.features || [],
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VenueModal;
