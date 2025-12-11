
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BookingFormFields from '@/components/Bookings/BookingFormFields';
import { BookingFormSchema, type BookingFormValues } from '@/components/Bookings/BookingFormSchema';
import { useIsMobile } from '@/hooks/use-mobile';

const BookingForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const startDateParam = searchParams.get('date');
  const isMobile = useIsMobile();

  // Helper to create default dates
  const getDefaultDate = (hoursToAdd = 0) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursToAdd);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      event_name: '',
      event_type: '',
      venue_id: '',
      client_id: '',
      start_date: startDateParam ? `${startDateParam}T09:00` : getDefaultDate(),
      end_date: startDateParam ? `${startDateParam}T17:00` : getDefaultDate(8), // Default end date 8 hours after start
      guest_count: 1,
      deposit_paid: false,
      status: 'pending',
      is_full_day: true,
      time_of_day: '',
    },
  });

  const createBooking = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      // Check if it's a wedding booking
      const isWedding = values.event_type === 'wedding';

      // First create the booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          event_name: values.event_name,
          event_type: values.event_type,
          venue_id: values.venue_id || null,
          client_id: isWedding ? null : values.client_id || null,
          start_date: values.start_date,
          end_date: values.end_date, // MUST NOT BE NULL (DB requires)
          guest_count: values.guest_count,
          total_amount: values.total_amount || null,
          deposit_amount: values.deposit_amount || null,
          deposit_paid: values.deposit_paid ?? false,
          notes: values.notes || null,
          status: values.status,
          is_full_day: values.is_full_day ? "true" : "false", // FIXED (DB expects TEXT)
          time_of_day: values.time_of_day || null, // ADD THIS
        })
        .select();


      if (bookingError) throw bookingError;

      // If this is a wedding booking, save additional data
      if (isWedding && bookingData && bookingData.length > 0) {
        const bookingId = bookingData[0].id;

        const { error: weddingError } = await supabase
          .from('wedding_bookings')
          .insert({
            booking_id: bookingId,
            client_name: values.client_name || '',
            bride_name: values.bride_name || '',
            groom_name: values.groom_name || '',
            address: values.address || '',
            phone: values.phone || '',
            is_full_day: values.is_full_day || true,
          });

        if (weddingError) throw weddingError;
      }

      return bookingData;
    },
    onMutate: async (values: BookingFormValues) => {
      // Cancel outgoing dashboardStats queries
      await queryClient.cancelQueries({ queryKey: ['dashboardStats'] });

      // Get current dashboardStats
      const previousStats = queryClient.getQueryData(['dashboardStats']) as any;

      if (previousStats) {
        // Check if booking is this month
        const bookingDate = new Date(values.start_date);
        const now = new Date();
        const isThisMonth = bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear();

        // Check if booking is today
        const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isToday = bookingDateOnly.getTime() === todayOnly.getTime();

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
        title: 'Booking created',
        description: 'The booking has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      navigate('/bookings');
    },
    onError: (error, variables, context: any) => {
      // Restore previous stats on error
      if (context?.previousStats) {
        queryClient.setQueryData(['dashboardStats'], context.previousStats);
      }
      toast({
        title: 'Error',
        description: `Failed to create booking: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: BookingFormValues) {
    createBooking.mutate(values);
  }

  return (
    <AppLayout>
      <PageHeader
        title="Create New Booking"
        description="Fill out the form below to create a new event booking."
      />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>Provide all the necessary details for this booking</CardDescription>
          {startDateParam && (
            <div className="text-sm text-muted-foreground mt-1">
              Pre-selected date: {new Date(startDateParam).toLocaleDateString()}
            </div>
          )}
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <BookingFormFields form={form} preSelectedDate={startDateParam} />

            <CardFooter className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/bookings')}
                className={isMobile ? "w-full" : ""}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBooking.isPending}
                className={isMobile ? "w-full" : ""}
              >
                {createBooking.isPending ? 'Creating...' : 'Create Booking'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default BookingForm;
