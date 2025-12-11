
import React, { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isBefore, startOfDay } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, X, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface Booking {
  id: string;
  client: { name: string } | null;
  event_name: string;
  event_type: string;
  venue: { name: string } | null;
  start_date: string;
  end_date: string;
  guest_count: number;
  status: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Check if the selected date is in the past
  const isSelectedDatePast = selectedDate ? isBefore(startOfDay(selectedDate), startOfDay(new Date())) : false;
  
  // Find bookings for the selected date
  const getBookingsForDate = (date: Date) => {
    if (!date) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return bookings.filter(booking => {
      const startDate = booking.start_date.split('T')[0];
      const endDate = booking.end_date ? booking.end_date.split('T')[0] : startDate;
      return startDate <= formattedDate && endDate >= formattedDate;
    });
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  
  // Delete booking mutation
  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Booking deleted',
        description: 'The booking has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete booking: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Generate date class name based on bookings
  const getDayClassName = (date: Date) => {
    const bookingsOnDate = getBookingsForDate(date);
    if (bookingsOnDate.length > 0) {
      // Determine if there are confirmed or cancelled bookings on this date
      const hasConfirmed = bookingsOnDate.some(b => b.status === 'confirmed');
      const hasCancelled = bookingsOnDate.some(b => b.status === 'cancelled');
      
      if (hasConfirmed) return "bg-green-100 text-green-800 font-bold rounded-full";
      if (hasCancelled) return "bg-red-100 text-red-800 font-bold rounded-full";
      return "bg-yellow-100 text-yellow-800 font-bold rounded-full"; // Pending
    }
    return "";
  };
  
  const handleDeleteConfirm = () => {
    if (deleteBookingId) {
      deleteBooking.mutate(deleteBookingId);
    }
  };

  const handleAddBooking = () => {
    if (selectedDate && !isSelectedDatePast) {
      // Navigate to booking form with pre-selected date
      navigate(`/bookings/new?date=${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  };

  const handleEditBooking = (id: string) => {
    navigate(`/bookings/edit/${id}`);
  };

  const isPastBooking = (startDate: string) => {
    return isBefore(new Date(startDate), startOfDay(new Date()));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md border p-4 w-full">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="p-3 pointer-events-auto w-full max-w-full"
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
              className={isSelectedDatePast ? "opacity-50 cursor-not-allowed" : ""}
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

          {selectedDateBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No bookings for this date
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateBookings.map(booking => {
                const isBookingPast = isPastBooking(booking.start_date);
                return (
                  <div 
                    key={booking.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{booking.event_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.client?.name || 'No client'} - {booking.venue?.name || 'No venue'}
                        </p>
                        <p className="text-xs mt-1">
                          {format(new Date(booking.start_date), 'h:mm a')} - 
                          {booking.end_date && format(new Date(booking.end_date), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditBooking(booking.id)}
                      >
                        {isBookingPast ? (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </>
                        )}
                      </Button>
                      {!isBookingPast && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setDeleteBookingId(booking.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteBooking.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteBooking.isPending}
            >
              {deleteBooking.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingCalendar;
