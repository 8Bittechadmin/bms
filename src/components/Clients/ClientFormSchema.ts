
import { z } from 'zod';

export const ClientFormSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  contact_person: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  type: z.string().default('individual'),
});

export type ClientFormValues = z.infer<typeof ClientFormSchema>;

export const CLIENT_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'non-profit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' },
];
