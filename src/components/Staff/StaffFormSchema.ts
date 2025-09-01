
import { z } from 'zod';

export const StaffFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  contact: z.string().email('Valid email is required'),
  status: z.enum(['available', 'on-duty', 'unavailable']),
});

export type StaffFormValues = z.infer<typeof StaffFormSchema>;

export const DEPARTMENT_OPTIONS = [
  { value: 'Operations', label: 'Operations' },
  { value: 'Catering', label: 'Catering' },
  { value: 'Culinary', label: 'Culinary' },
  { value: 'Service', label: 'Service' },
  { value: 'Technical', label: 'Technical' },
];

export const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'on-duty', label: 'On Duty' },
  { value: 'unavailable', label: 'Unavailable' },
];
