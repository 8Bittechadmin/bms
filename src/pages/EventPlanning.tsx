
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, List, Plus, CheckSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CreateEventModal from '@/components/EventPlanning/CreateEventModal';
import EditEventModal from '@/components/EventPlanning/EditEventModal';
import VendorModal from '@/components/EventPlanning/VendorModal';
import EventCard from '@/components/EventCard';
import BookingExport from '@/components/EventPlanning/BookingExport';

const EventPlanning = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          venue:venues(*),
          client:clients(*),
          wedding_bookings(*)
        `)
        .order('start_date', { ascending: false }) as any;
      
      if (error) throw error;
      return data || [];
    },
  });

  if (error) {
    console.error('Error loading events:', error);
    toast({
      title: 'Error',
      description: 'Failed to load events. Please try again.',
      variant: 'destructive',
    });
  }

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const toggleEventSelection = (eventId: string) => {
    if (selectedBookingIds.includes(eventId)) {
      setSelectedBookingIds(selectedBookingIds.filter(id => id !== eventId));
    } else {
      setSelectedBookingIds([...selectedBookingIds, eventId]);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedBookingIds([]);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Event Planning"
        description="Create and manage events for your venue"
        action={{
          label: "Create Event",
          icon: <Plus size={16} />,
          onClick: () => setIsCreateModalOpen(true)
        }}
      />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
          <Tabs defaultValue="upcoming" className="flex-1 w-full">
            <div className="w-full mb-4">
              <div className="overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex gap-2">
                  <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                  <TabsTrigger value="past">Past Events</TabsTrigger>
                  <TabsTrigger value="all">All Events</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap mt-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectionMode}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {isSelectionMode ? 'Cancel' : 'Select'}
              </Button>

              <div className="flex items-center">
                <BookingExport 
                  bookings={events}
                  selectedBookingIds={selectedBookingIds} 
                  isSelectionMode={isSelectionMode}
                />
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsVendorModalOpen(true)}
              >
                Add Vendor
              </Button>
            </div>
            <TabsContent value="upcoming" className="m-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : events.filter(e => new Date(e.start_date) >= new Date()).length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Upcoming Events</CardTitle>
                    <CardDescription>
                      You don't have any upcoming events scheduled.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      Create Your First Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events
                    .filter(event => new Date(event.start_date) >= new Date())
                    .map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onClick={() => handleEventClick(event)}
                        isSelectable={isSelectionMode}
                        isSelected={selectedBookingIds.includes(event.id)}
                        onSelect={() => toggleEventSelection(event.id)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="m-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : events.filter(e => new Date(e.start_date) < new Date()).length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Past Events</CardTitle>
                    <CardDescription>
                      You don't have any past events.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events
                    .filter(event => new Date(event.start_date) < new Date())
                    .map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onClick={() => handleEventClick(event)}
                        isSelectable={isSelectionMode}
                        isSelected={selectedBookingIds.includes(event.id)}
                        onSelect={() => toggleEventSelection(event.id)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="m-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Events</CardTitle>
                    <CardDescription>
                      You don't have any events yet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      Create Your First Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onClick={() => handleEventClick(event)}
                      isSelectable={isSelectionMode}
                      isSelected={selectedBookingIds.includes(event.id)}
                      onSelect={() => toggleEventSelection(event.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateEventModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
      
      {selectedEvent && (
        <EditEventModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          event={selectedEvent}
        />
      )}
      
      <VendorModal
        open={isVendorModalOpen}
        onOpenChange={setIsVendorModalOpen}
      />
    </AppLayout>
  );
};

export default EventPlanning;
