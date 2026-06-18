import { describe, expect, it } from 'vitest';

import { orderSchema } from './schema';

describe('orderSchema', () => {
  it('accepts an order with at least one valid item', () => {
    const result = orderSchema.safeParse({
      customer_id: 1,
      items: [{ product_id: 3, quantity: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an order with no items', () => {
    expect(orderSchema.safeParse({ customer_id: 1, items: [] }).success).toBe(false);
  });

  it('requires a customer', () => {
    expect(
      orderSchema.safeParse({ customer_id: 0, items: [{ product_id: 1, quantity: 1 }] }).success,
    ).toBe(false);
  });

  it('rejects a non-positive quantity', () => {
    expect(
      orderSchema.safeParse({ customer_id: 1, items: [{ product_id: 1, quantity: 0 }] }).success,
    ).toBe(false);
  });

  it('coerces numeric-string ids and quantities', () => {
    const result = orderSchema.safeParse({
      customer_id: '2',
      items: [{ product_id: '3', quantity: '4' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customer_id).toBe(2);
      expect(result.data.items[0].quantity).toBe(4);
    }
  });
});
