import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Mail, Phone, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VenueAvailabilityCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId?: string;
}

interface BookingDetails {
  id: string;
  event_name: string;
  event_type: string;
  start_date: string;
  end_date: string;
  is_full_day?: boolean;
  time_of_day?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  status: string;
  date: string;
  reason?: string;
  guest_count?: number;
  notes?: string;
}

interface VenueInfo {
  id: string;
  name: string;
  capacity: number;
  full_day_amount: number;
  half_day_amount: number;
}

const VenueAvailabilityCalendar: React.FC<VenueAvailabilityCalendarProps> = ({ 
  open, 
  onOpenChange,
  venueId
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateBookings, setDateBookings] = useState<BookingDetails[]>([]);
  
  // Fetch venue information
  const { data: venueInfo } = useQuery({
    queryKey: ['venue-info', venueId],
    queryFn: async () => {
      if (!venueId) return null;
      
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, capacity, full_day_amount, half_day_amount')
        .eq('id', venueId)
        .single();
        
      if (error) throw error;
      return data as VenueInfo;
    },
    enabled: !!venueId && open,
  });
  
  // Fetch unavailable dates and bookings
  const { data: unavailableDates = [], isLoading } = useQuery({
    queryKey: ['venue-unavailable-dates', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      
      // Get unavailable dates from venue_unavailable_dates table
      const { data: manuallyBlockedDates, error: error1 } = await supabase
        .from('venue_unavailable_dates')
        .select('date, reason')
        .eq('venue_id', venueId);
        
      if (error1) console.error('Error fetching unavailable dates:', error1);
      
      // Get bookings with detailed information
      const { data: bookings, error: error2 } = await supabase
        .from('bookings')
        .select('*')
        .eq('venue_id', venueId);
        
      if (error2) console.error('Error fetching bookings:', error2);
      
      // Get wedding booking details
      const { data: weddingBookings, error: error3 } = await supabase
        .from('wedding_bookings')
        .select('*');
        
      if (error3) console.error('Error fetching wedding bookings:', error3);
      
      // Get client details
      const { data: clients, error: error4 } = await supabase
        .from('clients')
        .select('*');
        
      if (error4) console.error('Error fetching clients:', error4);
      
      // Create maps for quick lookups
      const weddingMap = new Map();
      const clientMap = new Map();
      
      weddingBookings?.forEach(wedding => {
        weddingMap.set(wedding.booking_id, wedding);
      });
      
      clients?.forEach(client => {
        clientMap.set(client.id, client);
      });
      
      const bookedDates = bookings?.map(booking => {
        const isWedding = booking.event_type === 'wedding';
        const weddingData = weddingMap.get(booking.id);
        const clientData = clientMap.get(booking.client_id);
        
        const isFullDay = isWedding && weddingData ? weddingData.is_full_day : true;
        
        const startDate = new Date(booking.start_date);
        const startHour = startDate.getHours();
        
        // Determine if morning or evening for half-day bookings
        let timeOfDay;
        if (!isFullDay) {
          timeOfDay = startHour < 12 ? 'morning' : 'evening';
        }
        
        const formattedStatus = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
        
        // Get client name and details
        const clientName = isWedding && weddingData 
          ? weddingData.client_name 
          : clientData?.name || 'Unknown Client';
          
        const clientEmail = clientData?.email || '';
        const clientPhone = isWedding && weddingData 
          ? weddingData.phone 
          : clientData?.phone || '';
        
        return {
          id: booking.id,
          date: startDate.toISOString().split('T')[0],
          reason: `${booking.event_name} (${isFullDay ? 'Full Day' : `Half Day - ${timeOfDay === 'morning' ? 'Morning' : 'Evening'}`}) - ${formattedStatus}`,
          event_name: booking.event_name,
          event_type: booking.event_type,
          start_date: booking.start_date,
          end_date: booking.end_date,
          is_full_day: isFullDay,
          time_of_day: timeOfDay,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          status: booking.status,
          guest_count: booking.guest_count,
          notes: booking.notes
        };
      }) || [];
      
      // Combine both manual and booking-based unavailable dates
      return [
        ...(manuallyBlockedDates || []).map(item => ({
          date: item.date,
          reason: item.reason || 'Unavailable',
          id: '',
          event_name: 'Unavailable',
          event_type: 'blocked',
          start_date: '',
          end_date: '',
          is_full_day: true,
          status: 'blocked'
        })),
        ...bookedDates
      ];
    },
    enabled: !!venueId && open,
  });

  // Update date bookings when selected date changes
  useEffect(() => {
    if (selectedDate && unavailableDates) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const bookingsOnDate = unavailableDates.filter(item => item.date === dateString);
      setDateBookings(bookingsOnDate);
    } else {
      setDateBookings([]);
    }
  }, [selectedDate, unavailableDates]);

  // Convert the unavailable dates to a map for easy checking
  const unavailableDatesMap = new Map<string, {type: string; details: BookingDetails[]}>();
  unavailableDates.forEach(item => {
    const existing = unavailableDatesMap.get(item.date) || {type: 'none', details: []};
    
    // Determine the overall status for the day
    let newType = existing.type;
    
    // If there's a full-day booking, the entire day is full
    if (item.is_full_day && item.status !== 'cancelled') {
      newType = 'full';
    } 
    // If only half-day bookings, mark as half (only if not already marked as full)
    else if (newType !== 'full' && !item.is_full_day && item.status !== 'cancelled') {
      newType = 'half';
    }
    
    // Add this booking to the details array
    existing.details.push(item);
    
    // Update the map
    unavailableDatesMap.set(item.date, {type: newType, details: existing.details});
  });
  
  // Get the day status class
  const getDayClass = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayStatus = unavailableDatesMap.get(dateString);
    
    if (dayStatus?.type === 'full') return 'bg-red-100 text-red-800 font-semibold';
    if (dayStatus?.type === 'half') return 'bg-orange-100 text-orange-800 font-semibold';
    return '';
  };

  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get the badge color based on booking status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Get available time slots for the selected date
  const getAvailableSlots = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayBookings = unavailableDatesMap.get(dateString);
    
    if (!dayBookings || dayBookings.details.length === 0) {
      return ['Full Day', 'Morning (8:00 AM - 2:00 PM)', 'Evening (3:00 PM - 9:00 PM)'];
    }
    
    const hasFullDay = dayBookings.details.some(b => b.is_full_day && b.status !== 'cancelled');
    if (hasFullDay) return [];
    
    const hasMorning = dayBookings.details.some(b => !b.is_full_day && b.time_of_day === 'morning' && b.status !== 'cancelled');
    const hasEvening = dayBookings.details.some(b => !b.is_full_day && b.time_of_day === 'evening' && b.status !== 'cancelled');
    
    const availableSlots = [];
    if (!hasMorning && !hasEvening) availableSlots.push('Full Day');
    if (!hasMorning) availableSlots.push('Morning (8:00 AM - 2:00 PM)');
    if (!hasEvening) availableSlots.push('Evening (3:00 PM - 9:00 PM)');
    
    return availableSlots;
  };

  // Handle date selection with auto-close
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // Auto-close calendar after a short delay to allow user to see the selection
    if (date) {
      setTimeout(() => {
        // Calendar will close automatically after selection
      }, 100);
    }
  };

  if (!venueId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Venue Availability Calendar
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex justify-center items-center h-64">
            <p>Please select a venue to view availability calendar.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            {venueInfo?.name || 'Venue'} - Booking Calendar
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        {venueInfo && (
          <div className="text-sm text-muted-foreground -mt-2">
            Capacity: {venueInfo.capacity} guests • 
            Full Day: ${venueInfo.full_day_amount?.toLocaleString()} • 
            Half Day: ${venueInfo.half_day_amount?.toLocaleString()}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading calendar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border w-full pointer-events-auto"
                components={{
                  DayContent: ({ date }) => {
                    const dateString = format(date, 'yyyy-MM-dd');
                    const dayData = unavailableDatesMap.get(dateString);
                    const bookingCount = dayData?.details.filter(b => b.status !== 'cancelled').length || 0;
                    
                    return (
                      <div className={`h-full w-full flex flex-col justify-center items-center ${getDayClass(date)} rounded-sm`}>
                        <span>{date.getDate()}</span>
                        {bookingCount > 0 && (
                          <div className="text-xs mt-1 px-1 bg-white bg-opacity-80 rounded">
                            {bookingCount}
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
              
              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300"></div>
                  <span>Full Day Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-300"></div>
                  <span>Partially Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300"></div>
                  <span>Available</span>
                </div>
              </div>
            </div>
            
            {/* Details Section */}
            <div className="space-y-4">
              {selectedDate && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                      <div className="flex gap-1">
                        {isToday(selectedDate) && (
                          <Badge variant="outline" className="text-xs">Today</Badge>
                        )}
                        {isFuture(selectedDate) && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Available</Badge>
                        )}
                        {isPast(selectedDate) && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">Past</Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="bookings" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="bookings">Bookings ({dateBookings.length})</TabsTrigger>
                        <TabsTrigger value="availability">Availability</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="bookings" className="space-y-3 mt-4">
                        {dateBookings.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <CalendarIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>No bookings for this date</p>
                          </div>
                        ) : (
                          dateBookings.map((booking, idx) => (
                            <Card key={idx} className={`border-l-4 ${
                              booking.status === 'confirmed' ? 'border-l-green-500' :
                              booking.status === 'cancelled' ? 'border-l-red-500 opacity-60' :
                              booking.status === 'pending' ? 'border-l-yellow-500' :
                              'border-l-gray-500'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-base">{booking.event_name}</h4>
                                  <div className="flex gap-1">
                                    <Badge className={getStatusBadgeClass(booking.status)}>
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </Badge>
                                    <Badge variant="outline" className={booking.is_full_day ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}>
                                      {booking.is_full_day ? 'Full Day' : 'Half Day'}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {booking.event_type === 'wedding' && (
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">{booking.client_name}</span>
                                    </div>
                                    {booking.client_email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span>{booking.client_email}</span>
                                      </div>
                                    )}
                                    {booking.client_phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>{booking.client_phone}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {booking.start_date && (
                                  <div className="flex items-center gap-2 text-sm mt-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span>
                                      {formatTime(booking.start_date)}
                                      {booking.end_date && ` - ${formatTime(booking.end_date)}`}
                                    </span>
                                    {!booking.is_full_day && booking.time_of_day && (
                                      <Badge variant="outline" className="ml-2">
                                        {booking.time_of_day === 'morning' ? 'Morning Slot' : 'Evening Slot'}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                {booking.guest_count && (
                                  <div className="flex items-center gap-2 text-sm mt-1">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span>{booking.guest_count} guests</span>
                                  </div>
                                )}
                                
                                {booking.notes && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                    <strong>Notes:</strong> {booking.notes}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                      
                      <TabsContent value="availability" className="mt-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Available Time Slots</h4>
                          {isFuture(selectedDate) || isToday(selectedDate) ? (
                            getAvailableSlots(selectedDate).length > 0 ? (
                              <div className="space-y-2">
                                {getAvailableSlots(selectedDate).map((slot, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="text-green-800 font-medium">{slot}</span>
                                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                                  </div>
                                ))}
                                {venueInfo && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-sm text-blue-800">
                                      <strong>Pricing:</strong>
                                      <br />Full Day: ${venueInfo.full_day_amount?.toLocaleString()}
                                      <br />Half Day: ${venueInfo.half_day_amount?.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-red-600">
                                <p className="font-medium">Fully Booked</p>
                                <p className="text-sm">No time slots available for this date</p>
                              </div>
                            )
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <p>Past date - booking not available</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Close Calendar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VenueAvailabilityCalendar;
