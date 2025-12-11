import { z } from "zod";

export const BookingFormSchema = z.object({
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
.refine((data) => !!data.client_name || !!data.client_id, {
  message: "Client information is required",
  path: ["client_id"],
})
.refine((data) => {
  if (data.is_full_day === false) {
    return !!data.time_of_day;
  }
  return true;
}, {
  message: "Time of day is required for half-day bookings",
  path: ["time_of_day"],
});
