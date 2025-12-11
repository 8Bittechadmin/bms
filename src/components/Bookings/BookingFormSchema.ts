import { z } from "zod";
import { BookingFormValues } from "./BookingFormSchema"; // adjust path

export const BookingFormSchema = z
  .object({
    id: z.string().optional(),
    event_name: z.string().min(1, "Event name is required"),
    event_type: z.string().min(1, "Event type is required"),
    venue_id: z.string().min(1, "Venue is required").nullable(),
    client_id: z.string().optional().nullable(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    guest_count: z.number().min(1, "Guest count must be at least 1"),
    total_amount: z.number().optional().nullable(),
    deposit_amount: z.number().optional().nullable(),
    deposit_paid: z.boolean().default(false),
    notes: z.string().optional().nullable(),
    status: z.enum(["pending", "confirmed", "cancelled"]),
    client_name: z.string().optional(),
    bride_name: z.string().optional(),
    groom_name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    is_full_day: z.boolean().optional().nullable(),
    time_of_day: z.enum(["morning", "evening"]).optional().nullable(),
  })

  /** Require client info */
  .refine((data) => !!data.client_name || !!data.client_id, {
    message: "Client information is required",
    path: ["client_id"],
  })

  /** Require time_of_day when half day */
  .refine((data) => (data.is_full_day ? true : !!data.time_of_day), {
    message: "Time of day is required for half-day bookings",
    path: ["time_of_day"],
  })

  /** Booking conflict validation */
  .superRefine((data, ctx) => {
    const bookings: BookingFormValues[] =
      (ctx as any).context?.bookings ?? []; // <-- SAFE FIX

    const selectedDate = data.start_date?.split("T")[0];
    if (!selectedDate) return;

    // Same venue & date bookings (excluding current booking)
    const existingBookings = bookings.filter((b) => {
      const bDate = b.start_date?.split("T")[0];
      return (
        bDate === selectedDate &&
        b.venue_id === data.venue_id &&
        b.id !== data.id
      );
    });

    // FULL DAY conflict
    if (data.is_full_day) {
      const hasFullDay = existingBookings.some((b) => b.is_full_day);
      if (hasFullDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "A full-day booking already exists for this venue on the selected date",
          path: ["start_date"],
        });
      }
      return;
    }

    // HALF DAY conflict (max 2)
    const halfDayCount = existingBookings.filter((b) => !b.is_full_day).length;
    if (halfDayCount >= 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "This venue already has 2 half-day bookings on the selected date",
        path: ["start_date"],
      });
    }
  });
