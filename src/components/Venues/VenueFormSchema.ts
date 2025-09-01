
import { z } from 'zod';

export const VenueFormSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  square_footage: z.number().min(1, 'Square footage must be at least 1'),
  total_amount: z.number().min(0, 'Total amount must be at least 0'),
  deposit_amount: z.number().min(0, 'Deposit amount must be at least 0'),
  full_day_amount: z.number().min(0, 'Full day amount must be at least 0'),
  half_day_amount: z.number().min(0, 'Half day amount must be at least 0'),
  description: z.string().optional(),
  location: z.string().optional(),
  availability: z.enum(['available', 'booked', 'maintenance']),
  images: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
});

export type VenueFormValues = z.infer<typeof VenueFormSchema>;

export const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'maintenance', label: 'Maintenance' },
];
