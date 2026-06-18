import { describe, expect, it } from 'vitest';

import { productSchema } from './schema';

const valid = { name: 'Keyboard', sku: 'KBD-1', price: '139.00', quantity_in_stock: 5 };

describe('productSchema', () => {
  it('accepts a valid product', () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });

  it('coerces a numeric-string quantity', () => {
    const result = productSchema.safeParse({ ...valid, quantity_in_stock: '7' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity_in_stock).toBe(7);
    }
  });

  it('rejects a non-positive price', () => {
    expect(productSchema.safeParse({ ...valid, price: '0' }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, price: '-5' }).success).toBe(false);
  });

  it('rejects a malformed price', () => {
    expect(productSchema.safeParse({ ...valid, price: '12.999' }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, price: 'abc' }).success).toBe(false);
  });

  it('rejects an invalid SKU', () => {
    expect(productSchema.safeParse({ ...valid, sku: 'a' }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, sku: 'bad sku!' }).success).toBe(false);
  });

  it('rejects a negative quantity', () => {
    expect(productSchema.safeParse({ ...valid, quantity_in_stock: -1 }).success).toBe(false);
  });

  it('requires a name', () => {
    expect(productSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });
});
