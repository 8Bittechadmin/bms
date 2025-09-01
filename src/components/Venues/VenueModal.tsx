
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
import { useQueryClient } from '@tanstack/react-query';

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

  const handleSubmit = async (values: VenueFormValues) => {
    setIsSubmitting(true);
    
    try {
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
            toast({
              title: "Availability Adjusted",
              description: "This venue has active bookings, so it's been marked as 'Booked'.",
            });
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
            hourly_rate: values.total_amount || 0, // Use total_amount as hourly_rate fallback
            location: values.location,
            availability: availability,
            images: values.images || [],
            features: values.features || [],
            updated_at: new Date().toISOString(),
          })
          .eq('id', venue.id) as any;
        
        if (error) throw error;
        
        toast({
          title: 'Venue Updated',
          description: `${values.name} has been updated successfully.`,
        });
        
        // Also invalidate the specific venue query to update the details dialog
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
            hourly_rate: values.total_amount || 0, // Use total_amount as hourly_rate fallback
            location: values.location,
            availability: availability,
            images: values.images || [],
            features: values.features || []
          }) as any;
        
        if (error) throw error;
        
        toast({
          title: 'Venue Added',
          description: `${values.name} has been added successfully.`,
        });
      }
      
      // Invalidate the venues query to refetch data
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving venue:', error);
      toast({
        title: 'Error',
        description: error.message || 'There was a problem saving the venue.',
        variant: 'destructive',
      });
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
