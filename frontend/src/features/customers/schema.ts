import { z } from 'zod';

export const customerSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required').max(255),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
