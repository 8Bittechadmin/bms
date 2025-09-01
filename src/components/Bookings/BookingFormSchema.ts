
import { z } from 'zod';

export const BookingFormSchema = z.object({
  id: z.string().optional(), // Used for editing existing bookings
  event_name: z.string().min(1, 'Event name is required'),
  event_type: z.string().min(1, 'Event type is required'),
  venue_id: z.string().min(1, 'Venue is required'),
  client_id: z.string().optional(), // Optional for wedding events
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  guest_count: z.number().min(1, 'Guest count must be at least 1'),
  total_amount: z.number().optional(),
  deposit_amount: z.number().optional(),
  deposit_paid: z.boolean().default(false),
  notes: z.string().optional(),
  status: z.string(),
  // Wedding specific fields
  client_name: z.string().optional(),
  bride_name: z.string().optional(),
  groom_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  is_full_day: z.boolean().optional().default(true),
  time_of_day: z.string().optional(), // 'morning' or 'evening'
}).refine((data) => {
  // Validate client info: either client_id or client_name must be provided
  if (data.event_type === 'wedding') {
    return !!data.client_name;
  } else {
    return !!data.client_id;
  }
}, {
  message: 'Client information is required',
  path: ['client_id'], // This field will receive the error
}).refine((data) => {
  // Validate that half-day bookings have a time_of_day for all event types
  if (data.is_full_day === false) {
    return !!data.time_of_day;
  }
  return true;
}, {
  message: 'Time of day is required for half-day bookings',
  path: ['time_of_day'],
});

export type BookingFormValues = z.infer<typeof BookingFormSchema>;
