import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
import {
  BookingFormSchema,
  type BookingFormValues,
} from '@/components/Bookings/BookingFormSchema';
import { useIsMobile } from '@/hooks/use-mobile';

const BookingForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const startDateParam = searchParams.get('date');

  // Helper to produce valid Supabase ISO timestamps
  const formatISO = (date: string) => new Date(date).toISOString();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      event_name: '',
      event_type: '',
      venue_id: '',
      client_id: '',
      start_date: startDateParam ? `${startDateParam}T09:00` : '',
      end_date: startDateParam ? `${startDateParam}T17:00` : '',
      guest_count: 1,
      deposit_paid: false,
      total_amount: '',
      deposit_amount: '',
      status: 'pending',
      is_full_day: true,
      time_of_day: '',
      notes: '',
    },
  });

  const createBooking = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      console.log("FORM SUBMIT VALUES:", values);

      const payload = {
        event_name: values.event_name,
        event_type: values.event_type,
        venue_id: values.venue_id || null,
        client_id: values.event_type === "wedding" ? null : values.client_id || null,

        start_date: formatISO(values.start_date),
        end_date: formatISO(values.end_date),  // NOT NULL in DB

        guest_count: values.guest_count,
        total_amount: values.total_amount ? Number(values.total_amount) : null,
        deposit_amount: values.deposit_amount ? Number(values.deposit_amount) : null,
        deposit_paid: values.deposit_paid ?? false,
        notes: values.notes || null,

        status: values.status,

        // DB column is TEXT → convert boolean → string
        is_full_day: values.is_full_day ? "true" : "false",

        time_of_day: values.time_of_day || null,
      };

      console.log("PAYLOAD SENT TO SUPABASE:", payload);

      const { data, error } = await supabase
        .from("bookings")
        .insert(payload)
        .select();

      console.log("SUPABASE RESPONSE:", { data, error });

      if (error) throw error;
      return data;
    },

    onSuccess: () => {
      toast({
        title: "Booking created",
        description: "The booking has been successfully created.",
      });

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/bookings");
    },

    onError: (error: any) => {
      console.error("BOOKING CREATION ERROR:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
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
          <CardDescription>
            Provide all the necessary details for this booking
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <BookingFormFields form={form} preSelectedDate={startDateParam} />

            <CardFooter
              className={`flex ${isMobile ? "flex-col space-y-2" : "justify-between"}`}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/bookings")}
                className={isMobile ? "w-full" : ""}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={createBooking.isPending}
                className={isMobile ? "w-full" : ""}
              >
                {createBooking.isPending ? "Creating..." : "Create Booking"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default BookingForm;
