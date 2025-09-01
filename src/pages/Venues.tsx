
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Square, MapPin, Banknote, Calendar, Clock, User } from 'lucide-react';
import VenueModal from '@/components/Venues/VenueModal';
import VenueDetailsDialog from '@/components/Venues/VenueDetailsDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';

const Venues: React.FC = () => {
  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const { data: venues = [], isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name') as any;
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch bookings for all venues
  const { data: bookings = [] } = useQuery({
    queryKey: ['venue-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          clients (name),
          wedding_bookings (client_name)
        `)
        .gte('start_date', new Date().toISOString())
        .eq('status', 'confirmed')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
  
  if (error) {
    console.error('Error loading venues:', error);
    toast({
      title: 'Error loading venues',
      description: 'There was a problem loading the venues. Please try again later.',
      variant: 'destructive',
    });
  }
  
  const handleViewDetails = (venueId: string) => {
    setSelectedVenueId(venueId);
    setIsDetailsDialogOpen(true);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  const getVenueBookings = (venueId: string) => {
    return bookings.filter(booking => booking.venue_id === venueId).slice(0, 3); // Show only next 3 bookings
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getClientName = (booking: any) => {
    if (booking.event_type === 'wedding' && booking.wedding_bookings?.[0]?.client_name) {
      return booking.wedding_bookings[0].client_name;
    }
    return booking.clients?.name || 'N/A';
  };
  
  return (
    <AppLayout>
      <PageHeader 
        title="Venues" 
        description="Manage your banquet halls and event spaces"
        hideBackButton={true}
        action={{
          label: "Add Venue",
          icon: <Plus size={16} />,
          onClick: () => setIsAddVenueModalOpen(true)
        }}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <h3 className="text-lg font-medium text-muted-foreground">No venues found</h3>
          <p className="text-sm text-muted-foreground mt-1">Add a new venue to get started</p>
          <Button onClick={() => setIsAddVenueModalOpen(true)} className="mt-4">
            <Plus size={16} className="mr-2" />
            Add Venue
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map(venue => {
            const venueBookings = getVenueBookings(venue.id);
            
            return (
              <Card key={venue.id} className="overflow-hidden">
                {venue.images && venue.images.length > 0 ? (
                  <div className="aspect-video relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {venue.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="aspect-video w-full overflow-hidden">
                              <img 
                                src={image} 
                                alt={`${venue.name} - image ${index+1}`} 
                                className="h-full w-full object-cover"
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
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=500&auto=format&fit=crop" 
                      alt={venue.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle>{venue.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{venue.description}</p>
                  
                  {/* Venue stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Capacity: {venue.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4 text-gray-500" />
                      <span>{venue.square_footage} sq ft</span>
                    </div>
                    
                    {/* Only render location if it exists */}
                    {'location' in venue && venue.location && (
                      <div className="flex items-center gap-1 col-span-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{venue.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Display pricing information */}
                  <div className="border-t pt-2 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Full Day: {formatCurrency(venue.full_day_amount)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Half Day: {formatCurrency(venue.half_day_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Bookings Section */}
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Upcoming Bookings
                    </h4>
                    {venueBookings.length > 0 ? (
                      <div className="space-y-2">
                        {venueBookings.map((booking) => (
                          <div key={booking.id} className="p-2 bg-muted/30 rounded-md">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-medium">{booking.event_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {booking.event_type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(booking.start_date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{getClientName(booking)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {bookings.filter(b => b.venue_id === venue.id).length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{bookings.filter(b => b.venue_id === venue.id).length - 3} more bookings
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No upcoming bookings</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewDetails(venue.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      <VenueModal 
        open={isAddVenueModalOpen}
        onOpenChange={setIsAddVenueModalOpen}
      />
      
      {selectedVenueId && (
        <VenueDetailsDialog
          venueId={selectedVenueId}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}
    </AppLayout>
  );
};

export default Venues;
