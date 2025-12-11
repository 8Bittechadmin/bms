import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isBefore, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Booking {
  id: string;
  client: { name: string } | null;
  event_name: string;
  event_type: string;
  venue: { id: string; name: string } | null;
  start_date: string;
  end_date?: string;
  is_full_day: boolean;
  time_of_day?: 'morning' | 'evening';
  status: string;
}

interface Venue {
  id: string;
  name: string;
}

const BookingCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [availableVenues, setAvailableVenues] = useState<
    { venue: Venue; fullDayAvailable: boolean; morningAvailable: boolean; eveningAvailable: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const isSelectedDatePast = isBefore(startOfDay(selectedDate), startOfDay(new Date()));

  // Fetch bookings and venues from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, client(name), venue(id, name)');
        if (bookingsError) throw bookingsError;
        setBookings(bookingsData ?? []);

        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*');
        if (venuesError) throw venuesError;
        setVenues(venuesData ?? []);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBookingsForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => {
      if (!b.start_date) return false;
      const start = b.start_date.split('T')[0];
      const end = b.end_date?.split('T')[0] ?? start;
      return start <= formattedDate && end >= formattedDate;
    });
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  // Calculate availability
  useEffect(() => {
    if (!selectedDate) return;

    const bookingsForDate = getBookingsForDate(selectedDate);

    const availability = (venues ?? []).map(v => {
      const venueBookings = bookingsForDate.filter(b => b.venue?.id === v.id);

      const fullDayBooked = venueBookings.some(b => b.is_full_day);
      const halfDayMorningCount = venueBookings.filter(b => !b.is_full_day && b.time_of_day === 'morning').length;
      const halfDayEveningCount = venueBookings.filter(b => !b.is_full_day && b.time_of_day === 'evening').length;

      return {
        venue: v,
        fullDayAvailable: !fullDayBooked,
        morningAvailable: halfDayMorningCount < 2 && !fullDayBooked,
        eveningAvailable: halfDayEveningCount < 2 && !fullDayBooked,
      };
    });

    setAvailableVenues(availability);
  }, [selectedDate, bookings, venues]);

  const getDayClassName = (date: Date) => {
    const bookingsOnDate = getBookingsForDate(date);
    if (!bookingsOnDate.length) return '';
    const hasConfirmed = bookingsOnDate.some(b => b.status === 'confirmed');
    const hasCancelled = bookingsOnDate.some(b => b.status === 'cancelled');
    if (hasConfirmed) return 'bg-green-100 text-green-800 font-bold rounded-full';
    if (hasCancelled) return 'bg-red-100 text-red-800 font-bold rounded-full';
    return 'bg-yellow-100 text-yellow-800 font-bold rounded-full';
  };

  const handleAddBooking = () => {
    if (!isSelectedDatePast) {
      navigate(`/bookings/new?date=${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-white p-4 rounded-md w-full mx-auto">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="p-3 pointer-events-auto"
          components={{
            DayContent: ({ date }) => {
              const bookingsOnDate = getBookingsForDate(date);
              return (
                <div className={`flex flex-col items-center justify-center w-10 h-10 mx-auto rounded-full ${getDayClassName(date)}`}>
                  <span className="text-sm leading-none">{date.getDate()}</span>
                  {bookingsOnDate.length > 0 && (
                    <span className="text-[10px] mt-0.5 leading-none">{bookingsOnDate.length}</span>
                  )}
                </div>
              );
            }
          }}
        />
      </div>

      {/* Venue Availability */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <Button onClick={handleAddBooking} size="sm" disabled={isSelectedDatePast} className={isSelectedDatePast ? 'opacity-50 cursor-not-allowed' : ''}>
              Add Booking
            </Button>
          </div>

          {isSelectedDatePast && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Cannot add new bookings to past dates. You can only view existing bookings.
              </p>
            </div>
          )}

          {availableVenues.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No bookings or venues for this date</p>
          ) : (
            <div className="space-y-3">
              {availableVenues.map(({ venue, fullDayAvailable, morningAvailable, eveningAvailable }) => (
                <div key={venue?.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <h4 className="font-medium">{venue?.name ?? 'Unknown Venue'}</h4>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className={fullDayAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      Full Day {fullDayAvailable ? 'Available' : 'Booked'}
                    </Badge>
                    <Badge className={morningAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      Morning {morningAvailable ? 'Available' : 'Booked'}
                    </Badge>
                    <Badge className={eveningAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      Evening {eveningAvailable ? 'Available' : 'Booked'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
