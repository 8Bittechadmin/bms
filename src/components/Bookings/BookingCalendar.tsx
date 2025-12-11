import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isBefore, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  client: { name: string } | null;
  event_name: string;
  event_type: string;
  venue: { id: string; name: string } | null;
  start_date: string;
  end_date: string;
  is_full_day: boolean;
  time_of_day?: string;
  status: string;
}

interface Venue {
  id: string;
  name: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  venues: Venue[];
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings = [], venues = [] }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableVenues, setAvailableVenues] = useState<
    { venue: Venue; fullDayAvailable: boolean; morningAvailable: boolean; eveningAvailable: boolean }[]
  >([]);

  const navigate = useNavigate();
  const isSelectedDatePast = selectedDate ? isBefore(startOfDay(selectedDate), startOfDay(new Date())) : false;

  const getBookingsForDate = (date: Date) => {
    if (!date) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return bookings.filter((b) => {
      if (!b.start_date) return false;
      const start = b.start_date?.split('T')[0] ?? '';
      const end = b.end_date?.split('T')[0] ?? start;
      return start <= formattedDate && end >= formattedDate;
    });
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  useEffect(() => {
    if (!selectedDate) return;

    const bookingsForDate = getBookingsForDate(selectedDate);

    const availability = (venues || []).map((v) => {
      const venueBookings = (selectedDateBookings || []).filter((b) => b.venue?.id === v.id);

      const fullDayBooked = venueBookings.some((b) => b.is_full_day);

      const halfDayMorningCount = venueBookings.filter((b) => !b.is_full_day && b.time_of_day === 'morning').length;
      const halfDayEveningCount = venueBookings.filter((b) => !b.is_full_day && b.time_of_day === 'evening').length;

      return {
        venue: v,
        fullDayAvailable: !fullDayBooked,
        morningAvailable: halfDayMorningCount < 2 && !fullDayBooked,
        eveningAvailable: halfDayEveningCount < 2 && !fullDayBooked,
      };
    });

    setAvailableVenues(availability);
  }, [selectedDate, venues]);

  const getDayClassName = (date: Date) => {
    const bookingsOnDate = getBookingsForDate(date);
    if (!bookingsOnDate.length) return '';
    const hasConfirmed = bookingsOnDate.some((b) => b.status === 'confirmed');
    const hasCancelled = bookingsOnDate.some((b) => b.status === 'cancelled');
    if (hasConfirmed) return 'bg-green-100 text-green-800 font-bold rounded-full';
    if (hasCancelled) return 'bg-red-100 text-red-800 font-bold rounded-full';
    return 'bg-yellow-100 text-yellow-800 font-bold rounded-full';
  };

  const handleAddBooking = () => {
    if (selectedDate && !isSelectedDatePast) {
      navigate(`/bookings/new?date=${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  };

  return (
    <div className="space-y-4">
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
            },
          }}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            <Button
              onClick={handleAddBooking}
              size="sm"
              disabled={isSelectedDatePast}
              className={isSelectedDatePast ? 'opacity-50 cursor-not-allowed' : ''}
            >
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

          {/* Venue Availability Section */}
          <div className="space-y-3">
            {availableVenues.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No bookings for this date</p>
            ) : (
              availableVenues.map(({ venue, fullDayAvailable, morningAvailable, eveningAvailable }) => (
                <div key={venue.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <h4 className="font-medium">{venue.name}</h4>
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
              ))
            )}
          </div>

          {/* Divider */}
          <hr className="my-4" />

          {/* Bookings List */}
          <h3 className="text-lg font-medium mb-2">Bookings</h3>

          {selectedDateBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No bookings on this date</p>
          ) : (
            <div className="space-y-3">
              {selectedDateBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <h4 className="font-medium">{booking.event_name}</h4>

                  <p className="text-sm text-muted-foreground">
                    {booking.client?.name || 'No client'} — {booking.venue?.name || 'No venue'}
                  </p>

                  <p className="text-xs mt-1">
                    {booking.start_date && format(new Date(booking.start_date), 'h:mm a')} —
                    {booking.end_date && format(new Date(booking.end_date), 'h:mm a')}
                  </p>

                  <Badge
                    className={
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {booking.status}
                  </Badge>
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
