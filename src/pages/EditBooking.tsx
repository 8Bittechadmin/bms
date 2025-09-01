import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { isBefore, startOfToday } from 'date-fns';

const EditBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const isMobile = useIsMobile();
  
  console.log('EditBooking - ID from params:', id);
  
  // Helper to format dates from database to input format
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    // Convert to ISO string and remove seconds and milliseconds
    return new Date(dateString).toISOString().slice(0, 16);
  };
  
  // Fetch booking with wedding data in a single query
  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-with-wedding', id],
    queryFn: async () => {
      console.log('Fetching booking with ID:', id);
      
      if (!id) {
        throw new Error('No booking ID provided');
      }
      
      // First, fetch the booking data
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (bookingError) {
        console.error('Error fetching booking:', bookingError);
        throw bookingError;
      }
      
      console.log('Raw booking data:', booking);
      
      // Fetch wedding data if it exists
      const { data: weddingData, error: weddingError } = await supabase
        .from('wedding_bookings')
        .select('*')
        .eq('booking_id', id);
      
      if (weddingError && weddingError.code !== 'PGRST116') {
        console.error('Error fetching wedding data:', weddingError);
        throw weddingError;
      }
      
      // Fetch client data if client_id exists
      let clientData = null;
      if (booking.client_id) {
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('name')
          .eq('id', booking.client_id)
          .single();
        
        if (clientError) {
          console.error('Error fetching client:', clientError);
        } else {
          clientData = client;
        }
      }
      
      // Fetch venue data if venue_id exists
      let venueData = null;
      if (booking.venue_id) {
        const { data: venue, error: venueError } = await supabase
          .from('venues')
          .select('name')
          .eq('id', booking.venue_id)
          .single();
        
        if (venueError) {
          console.error('Error fetching venue:', venueError);
        } else {
          venueData = venue;
        }
      }
      
      // Combine all data
      const combinedData = {
        ...booking,
        wedding_bookings: weddingData || [],
        client: clientData,
        venue: venueData
      };
      
      console.log('Fetched combined booking data:', combinedData);
      return combinedData;
    },
    enabled: !!id,
  });
  
  // Check if booking is in the past
  const isPastBooking = data?.start_date ? isBefore(new Date(data.start_date), startOfToday()) : false;
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      id: id,
      event_name: '',
      event_type: '',
      venue_id: '',
      client_id: '',
      start_date: '',
      end_date: '',
      guest_count: 1,
      deposit_paid: false,
      status: 'pending',
      is_full_day: true,
      time_of_day: '',
    },
  });
  
  // Set form values when booking data is loaded
  useEffect(() => {
    if (data) {
      console.log('Setting form values with data:', data);
      const isWedding = data.event_type === 'wedding';
      const weddingData = isWedding && data.wedding_bookings?.length > 0 ? data.wedding_bookings[0] : null;
      
      // Determine if it's full day based on start/end times
      let isFullDay = true;
      let timeOfDay = '';
      
      if (data.start_date && data.end_date) {
        const startHour = new Date(data.start_date).getHours();
        const endHour = new Date(data.end_date).getHours();
        
        // Check if it's a half day booking (4 hour duration)
        const duration = (new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / (1000 * 60 * 60);
        
        if (duration <= 4) {
          isFullDay = false;
          timeOfDay = startHour < 12 ? 'morning' : 'evening';
        }
        
        // For wedding bookings, use the is_full_day field if available
        if (isWedding && weddingData && weddingData.hasOwnProperty('is_full_day')) {
          isFullDay = weddingData.is_full_day;
          if (!isFullDay) {
            timeOfDay = startHour < 12 ? 'morning' : 'evening';
          }
        }
      }
      
      // Set regular booking fields
      const formValues: any = {
        id: data.id,
        event_name: data.event_name,
        event_type: data.event_type,
        venue_id: data.venue_id,
        client_id: data.client_id || '',
        start_date: formatDateForInput(data.start_date),
        end_date: formatDateForInput(data.end_date),
        guest_count: data.guest_count,
        total_amount: data.total_amount,
        deposit_amount: data.deposit_amount,
        deposit_paid: data.deposit_paid,
        notes: data.notes || '',
        status: data.status,
        is_full_day: isFullDay,
        time_of_day: timeOfDay,
      };
      
      // Add wedding specific fields if this is a wedding booking
      if (isWedding && weddingData) {
        formValues.client_name = weddingData.client_name;
        formValues.bride_name = weddingData.bride_name;
        formValues.groom_name = weddingData.groom_name;
        formValues.address = weddingData.address;
        formValues.phone = weddingData.phone;
      }
      
      console.log('Form values to set:', formValues);
      form.reset(formValues);
    }
  }, [data, form]);

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('EditBooking query error:', error);
    }
  }, [error]);

  const updateBooking = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      const isWedding = values.event_type === 'wedding';
      
      // Update the booking first
      const { data, error } = await supabase
        .from('bookings')
        .update({
          event_name: values.event_name,
          event_type: values.event_type,
          venue_id: values.venue_id,
          client_id: isWedding ? null : values.client_id,
          start_date: values.start_date,
          end_date: values.end_date || null,
          guest_count: values.guest_count,
          total_amount: values.total_amount || null,
          deposit_amount: values.deposit_amount || null,
          deposit_paid: values.deposit_paid,
          notes: values.notes || null,
          status: values.status,
          is_full_day: values.is_full_day ?? true,
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      // If this is a wedding booking, update the wedding specific data
      if (isWedding) {
        // Check if wedding data exists first
        const { data: existingData, error: checkError } = await supabase
          .from('wedding_bookings')
          .select('id')
          .eq('booking_id', id);
          
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        const weddingData = {
          client_name: values.client_name || '',
          bride_name: values.bride_name || '',
          groom_name: values.groom_name || '',
          address: values.address || '',
          phone: values.phone || '',
          is_full_day: values.is_full_day || true,
        };
        
        if (existingData && existingData.length > 0) {
          // Update existing wedding data
          const { error: updateError } = await supabase
            .from('wedding_bookings')
            .update(weddingData)
            .eq('booking_id', id);
            
          if (updateError) throw updateError;
        } else {
          // Insert new wedding data
          const { error: insertError } = await supabase
            .from('wedding_bookings')
            .insert({
              booking_id: id,
              ...weddingData
            });
            
          if (insertError) throw insertError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Booking updated',
        description: 'The booking has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-with-wedding', id] });
      navigate('/bookings');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update booking: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const checkRelatedInvoices = async () => {
    if (!id) return false;
    
    const { data, error } = await supabase
      .from('invoices')
      .select('id')
      .eq('booking_id', id);
      
    if (error) {
      throw error;
    }
    
    return data && data.length > 0;
  };
  
  const deleteRelatedInvoices = async () => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('booking_id', id);
      
    if (error) throw error;
  };
  
  const deleteWeddingData = async () => {
    const { error } = await supabase
      .from('wedding_bookings')
      .delete()
      .eq('booking_id', id);
      
    if (error && error.code !== 'PGRST116') throw error;
  };

  const deleteBooking = useMutation({
    mutationFn: async () => {
      setDeleteError(null);
      
      try {
        // Check for related invoices
        const hasInvoices = await checkRelatedInvoices();
        
        if (hasInvoices) {
          // Delete related invoices first
          await deleteRelatedInvoices();
        }
        
        // Delete any wedding data
        await deleteWeddingData();
        
        // Now delete the booking
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      } catch (error: any) {
        setDeleteError(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Booking deleted',
        description: 'The booking has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/bookings');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete booking: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: BookingFormValues) {
    if (isPastBooking) {
      toast({
        title: 'Cannot update past booking',
        description: 'Past bookings cannot be modified.',
        variant: 'destructive',
      });
      return;
    }
    updateBooking.mutate(values);
  }

  function handleDelete() {
    if (isPastBooking) {
      toast({
        title: 'Cannot delete past booking',
        description: 'Past bookings cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }
    if (window.confirm('Are you sure you want to delete this booking? This action will also delete any related invoices and cannot be undone.')) {
      deleteBooking.mutate();
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full mb-4"></div>
            <p>Loading booking...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    console.log('Booking not found - error:', error, 'data:', data);
    return (
      <AppLayout>
        <div className="text-center p-12">
          <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error ? `Error: ${error.message}` : "The booking you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => navigate('/bookings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={isPastBooking ? "View Booking" : "Edit Booking"}
        description={isPastBooking ? "View the details for this past booking." : "Update the details for this event booking."}
      />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{data.event_name}</CardTitle>
              <CardDescription>
                {data.client?.name && `Client: ${data.client.name}`}
                {data.venue?.name && ` • Venue: ${data.venue.name}`}
              </CardDescription>
            </div>
            {!isPastBooking && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {deleteError && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {deleteError}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <BookingFormFields form={form} readOnly={isPastBooking} />
            
            <CardFooter className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/bookings')}
                className={isMobile ? "w-full" : ""}
              >
                {isPastBooking ? 'Back' : 'Cancel'}
              </Button>
              {!isPastBooking && (
                <Button 
                  type="submit"
                  disabled={updateBooking.isPending}
                  className={isMobile ? "w-full" : ""}
                >
                  {updateBooking.isPending ? 'Updating...' : 'Update Booking'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default EditBooking;
