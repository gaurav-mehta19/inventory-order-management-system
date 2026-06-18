import { describe, expect, it } from 'vitest';

import { customerSchema } from './schema';

describe('customerSchema', () => {
  it('accepts a valid customer and lowercases the email', () => {
    const result = customerSchema.safeParse({
      full_name: 'Ada Lovelace',
      email: 'ADA@Example.com',
      phone: '+1 202 555 0100',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('ada@example.com');
    }
  });

  it('treats phone as optional (empty allowed)', () => {
    const result = customerSchema.safeParse({
      full_name: 'Ada',
      email: 'ada@example.com',
      phone: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(customerSchema.safeParse({ full_name: 'Ada', email: 'not-an-email' }).success).toBe(
      false,
    );
  });

  it('rejects an invalid phone', () => {
    expect(
      customerSchema.safeParse({ full_name: 'Ada', email: 'ada@example.com', phone: 'abc' })
        .success,
    ).toBe(false);
  });

  it('requires a full name', () => {
    expect(customerSchema.safeParse({ full_name: '', email: 'ada@example.com' }).success).toBe(
      false,
    );
  });
});
