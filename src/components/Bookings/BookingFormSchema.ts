import { z } from 'zod';
import { BookingFormValues } from './BookingFormSchema'; // adjust path

export const BookingFormSchema = z.object({
  id: z.string().optional(),
  event_name: z.string().min(1, 'Event name is required'),
  event_type: z.string().min(1, 'Event type is required'),
  venue_id: z.string().min(1, 'Venue is required').nullable(),
  client_id: z.string().optional().nullable(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  guest_count: z.number().min(1, 'Guest count must be at least 1'),
  total_amount: z.number().optional().nullable(),
  deposit_amount: z.number().optional().nullable(),
  deposit_paid: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  client_name: z.string().optional(),
  bride_name: z.string().optional(),
  groom_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  is_full_day: z.boolean().optional().nullable(),
  time_of_day: z.enum(['morning','evening']).optional().nullable(), // 'morning' | 'evening'
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
  // venue-aware booking conflict validation
  const bookings: BookingFormValues[] = ctx.options?.context?.bookings ?? [];
  const selectedDate = data.start_date?.split('T')[0];
  if (!selectedDate) return true;

  // Filter bookings for the same date and venue, excluding current booking if editing
  const existingBookings = bookings.filter(b => {
  const bDate = b.start_date?.split('T')[0];
  return bDate === selectedDate && b.id !== data.id && b.venue_id === data.venue_id;
});

  if (data.is_full_day) {
    const hasFullDayBooking = existingBookings.some(b => b.is_full_day);
    if (hasFullDayBooking) return false;
  } else {
    const halfDayCount = existingBookings.filter(b => !b.is_full_day).length;
    if (halfDayCount >= 2) return false;
  }

  return true;
}, {
  message: 'Selected venue already has maximum allowed bookings (1 full day or 2 half days) on this date',
  path: ['start_date'],
});
