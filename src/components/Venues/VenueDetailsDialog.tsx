
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Square, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DeleteConfirmDialog from '@/components/Common/DeleteConfirmDialog';
import VenueModal from './VenueModal';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';

interface VenueDetailsDialogProps {
  venueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VenueDetailsDialog: React.FC<VenueDetailsDialogProps> = ({ venueId, open, onOpenChange }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: venue, isLoading, error } = useQuery({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open, // Only fetch when the dialog is open
  });

  if (error) {
    console.error('Error loading venue details:', error);
    toast({
      title: 'Error loading venue details',
      description: 'There was a problem loading the venue details. Please try again later.',
      variant: 'destructive',
    });
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!venue) return;
    
    setIsDeleting(true);
    try {
      // First check if venue has active bookings
      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('venue_id', venueId)
        .gt('end_date', new Date().toISOString())
        .eq('status', 'confirmed')
        .limit(1);
      
      if (activeBookings && activeBookings.length > 0) {
        toast({
          title: "Cannot Delete Venue",
          description: "This venue has active bookings. Cancel or complete those bookings first.",
          variant: "destructive"
        });
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // If no active bookings, proceed with deletion
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);
      
      if (error) throw error;
      
      toast({
        title: 'Venue Deleted',
        description: `${venue.name} has been deleted successfully.`
      });
      
      // Close all dialogs and refresh the venues list
      onOpenChange(false);
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the venue.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'booked': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    return availability.charAt(0).toUpperCase() + availability.slice(1);
  };

  // Function to handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          {/* This trigger is not visible, it's just needed for the dialog to open */}
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-[650px] overflow-y-auto max-h-[90vh]">
          <AlertDialogHeader>
            <div className="flex justify-between items-center">
              <AlertDialogTitle>{venue?.name || 'Loading...'}</AlertDialogTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <Edit size={18} className="text-blue-500" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 size={18} className="text-red-500" />
                </Button>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            {isLoading ? (
              <AlertDialogDescription>Loading venue details...</AlertDialogDescription>
            ) : venue ? (
              <>
                {venue.images && venue.images.length > 0 ? (
                  <div className="space-y-3">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {venue.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="aspect-video overflow-hidden rounded-lg">
                              <img 
                                src={image} 
                                alt={`${venue.name} - image ${index+1}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=500&auto=format&fit=crop';
                                }}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {venue.images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </>
                      )}
                    </Carousel>
                    
                    {/* Image Thumbnails */}
                    {venue.images.length > 1 && (
                      <div className="flex overflow-x-auto gap-2 pb-2">
                        {venue.images.map((image, index) => (
                          <div 
                            key={index}
                            className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${
                              selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => handleThumbnailClick(index)}
                          >
                            <img 
                              src={image} 
                              alt={`Thumbnail ${index + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=500&auto=format&fit=crop';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden rounded-md">
                    <img 
                      src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=500&auto=format&fit=crop" 
                      alt={venue.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                
                <AlertDialogDescription>
                  <div className="grid gap-4 text-sm">
                    <Badge className={getAvailabilityColor(venue.availability || 'available')}>
                      {getAvailabilityLabel(venue.availability || 'available')}
                    </Badge>
                    
                    {venue.description && (
                      <p className="text-muted-foreground">{venue.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Capacity: {venue.capacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-gray-500" />
                        <span>{venue.square_footage} sq ft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>${venue.hourly_rate}/hour</span>
                      </div>
                      {venue.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{venue.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Pricing Information */}
                    <div className="grid grid-cols-2 gap-3 mt-2 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Full Day:</span>
                        <span>${venue.full_day_amount || venue.total_amount || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Half Day:</span>
                        <span>${venue.half_day_amount || Math.round((venue.full_day_amount || venue.total_amount || 0) / 2) || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Deposit:</span>
                        <span>${venue.deposit_amount || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {venue.features && venue.features.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {venue.features.map((feature: string, index: number) => (
                            <Badge key={index} variant="outline">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </>
            ) : (
              <AlertDialogDescription>Failed to load venue details.</AlertDialogDescription>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Modal */}
      {venue && (
        <VenueModal 
          open={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen} 
          venue={venue} 
          isEditing={true}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={`Delete ${venue?.name || 'Venue'}`}
        description="This will permanently delete this venue. This action cannot be undone."
      />
    </>
  );
};

export default VenueDetailsDialog;
