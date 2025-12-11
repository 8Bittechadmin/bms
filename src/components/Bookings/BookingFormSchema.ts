import { z } from 'zod';
import { BookingFormValues } from './BookingFormSchema'; // adjust path

export const BookingFormSchema = z.object({
  id: z.string().optional(),
  event_name: z.string().min(1, 'Event name is required'),
  event_type: z.string().min(1, 'Event type is required'),
  venue_id: z.string().min(1, 'Venue is required'),
  client_id: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  guest_count: z.number().min(1, 'Guest count must be at least 1'),
  total_amount: z.number().optional(),
  deposit_amount: z.number().optional(),
  deposit_paid: z.boolean().default(false),
  notes: z.string().optional(),
  status: z.string(),
  client_name: z.string().optional(),
  bride_name: z.string().optional(),
  groom_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  is_full_day: z.boolean().optional().default(true),
  time_of_day: z.string().optional(),
})
.refine((data) => !!data.client_name || !!data.client_id, {
  message: 'Client information is required',
  path: ['client_id'],
})
.refine((data) => data.is_full_day === false ? !!data.time_of_day : true, {
  message: 'Time of day is required for half-day bookings',
  path: ['time_of_day'],
})
.refine((data, ctx) => {
  // This refinement checks bookings per date
  const bookings: BookingFormValues[] = ctx.options?.context?.bookings || [];
  const selectedDate = data.start_date?.split('T')[0];
  if (!selectedDate) return true;

  const existingBookings = bookings.filter(b => {
    const bDate = b.start_date?.split('T')[0];
    return bDate === selectedDate && b.id !== data.id;
  });

  if (data.is_full_day && existingBookings.length > 0) {
    return false; // Cannot book full day if any booking exists
  }

  if (!data.is_full_day) {
    // Half day can have max 2 bookings per day
    if (existingBookings.length >= 2) return false;
  }

  return true;
}, {
  message: 'Selected date/time already has maximum allowed bookings',
  path: ['start_date'],
});
