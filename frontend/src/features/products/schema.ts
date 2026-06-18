import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  sku: z
    .string()
    .trim()
    .min(2, 'SKU must be at least 2 characters')
    .max(64)
    .regex(/^[A-Za-z0-9][A-Za-z0-9\-_]+$/, 'Use letters, numbers, hyphens or underscores'),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price')
    .refine((value) => Number(value) > 0, 'Price must be greater than 0'),
  quantity_in_stock: z.coerce
    .number({ invalid_type_error: 'Enter a quantity' })
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
