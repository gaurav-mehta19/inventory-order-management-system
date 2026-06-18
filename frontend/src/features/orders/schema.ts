import { z } from 'zod';

export const orderSchema = z.object({
  customer_id: z.coerce
    .number({ invalid_type_error: 'Select a customer' })
    .int()
    .positive('Select a customer'),
  items: z
    .array(
      z.object({
        product_id: z.coerce
          .number({ invalid_type_error: 'Select a product' })
          .int()
          .positive('Select a product'),
        quantity: z.coerce
          .number({ invalid_type_error: 'Enter a quantity' })
          .int('Whole numbers only')
          .min(1, 'Min 1'),
      }),
    )
    .min(1, 'Add at least one product'),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
