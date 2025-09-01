
import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional().nullable(),
  due_date: z.date().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  booking_id: z.string().optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
});

export type TaskFormSchemaType = z.infer<typeof taskFormSchema>;
