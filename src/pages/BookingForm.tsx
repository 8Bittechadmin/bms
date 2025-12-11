import React, { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BookingFormFields from "@/components/Bookings/BookingFormFields";
import {
  BookingFormSchema,
  type BookingFormValues,
} from "@/components/Bookings/BookingFormSchema";
import { useIsMobile } from "@/hooks/use-mobile";

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const startDateParam = searchParams.get("date");
  const isMobile = useIsMobile();

  const getDefaultDate = (hoursToAdd = 0) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursToAdd);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  };

  // fetch bookings (used by Zod validation via resolver context)
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useQuery<BookingFormValues[]>(
    ["bookings"],
    async () => {
      const { data, error } = await supabase.from("bookings").select("*");
      if (error) throw error;
      return data || [];
    },
    { staleTime: 30_000 } // small optimization
  );

  // memoized resolver so context updates when bookings change
  const resolver = useMemo(
    () => zodResolver(BookingFormSchema, { context: { bookings } }),
    [bookings]
  );

  const form = useForm<BookingFormValues>({
    resolver,
    mode: "onChange",
    defaultValues: {
      event_name: "",
      event_type: "conference",
      venue_id: null,
      client_id: null,
      start_date: startDateParam ? `${startDateParam}T09:00` : getDefaultDate(),
      end_date: startDateParam ? `${startDateParam}T17:00` : getDefaultDate(8),
      guest_count: 1,
      deposit_paid: false,
      status: "pending",
      is_full_day: true,
      time_of_day: null,
      total_amount: null,
      deposit_amount: null,
      notes: null,
      client_name: "",
      bride_name: "",
      groom_name: "",
      address: "",
      phone: "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid, errors },
  } = form;

  // mutation
  const createBooking = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      const isWedding = values.event_type === "wedding";

      // convert to formats expected by your DB
      const payload = {
        event_name: values.event_name,
        event_type: values.event_type,
        venue_id: values.venue_id || null,
        client_id: isWedding ? null : values.client_id || null,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        guest_count: values.guest_count ?? 0,
        total_amount:
          typeof values.total_amount === "number"
            ? values.total_amount
            : null,
        deposit_amount:
          typeof values.deposit_amount === "number"
            ? values.deposit_amount
            : null,
        deposit_paid: values.deposit_paid ?? false,
        notes: values.notes || null,
        status: values.status || "pending",
        // DB column is text (per your earlier schema) — store as "true"/"false"
        is_full_day:
          values.is_full_day === true || values.is_full_day === "true"
            ? "true"
            : "false",
        time_of_day: values.time_of_day || null,
      };

      // send to supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert(payload)
        .select();

      if (bookingError) throw bookingError;

      // wedding details
      if (isWedding && bookingData?.length) {
        const bookingId = bookingData[0].id;
        const { error: weddingError } = await supabase
          .from("wedding_bookings")
          .insert({
            booking_id: bookingId,
            client_name: values.client_name || "",
            bride_name: values.bride_name || "",
            groom_name: values.groom_name || "",
            address: values.address || "",
            phone: values.phone || "",
            is_full_day:
              values.is_full_day === true || values.is_full_day === "true"
                ? "true"
                : "false",
          });
        if (weddingError) throw weddingError;
      }

      return bookingData;
    },
    onSuccess: () => {
      toast({
        title: "Booking created",
        description: "The booking has been successfully created.",
      });
      queryClient.invalidateQueries(["bookings"]);
      navigate("/bookings");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // final submit — react-hook-form already runs Zod resolver (with bookings context)
  const onSubmit = async (values: BookingFormValues) => {
    // handle case where schema didn't catch something (extra safety)
    // (Zod already enforces venue/day conflicts via your superRefine)
    await createBooking.mutateAsync(values);
  };

  if (bookingsLoading) return <div>Loading...</div>;
  if (bookingsError)
    return <div className="text-red-600">Failed to load bookings.</div>;

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

          {startDateParam && (
            <div className="text-sm text-muted-foreground mt-1">
              Pre-selected date: {new Date(startDateParam).toLocaleDateString()}
            </div>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <BookingFormFields form={form} preSelectedDate={startDateParam} />

            {/* show schema-level error for start_date (conflict) */}
            {errors.start_date && (
              <div className="text-sm text-red-600 mt-2">
                {errors.start_date.message?.toString()}
              </div>
            )}

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
                disabled={!isValid || createBooking.isLoading}
                className={isMobile ? "w-full" : ""}
              >
                {createBooking.isLoading ? "Creating..." : "Create Booking"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default BookingForm;
