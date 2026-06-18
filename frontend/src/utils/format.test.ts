import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDate, formatDateTime, formatNumber, initials } from './format';

describe('formatCurrency', () => {
  it('formats numeric strings as USD', () => {
    expect(formatCurrency('139.00')).toBe('$139.00');
    expect(formatCurrency(1299.5)).toBe('$1,299.50');
  });

  it('falls back to $0.00 for non-numeric input', () => {
    expect(formatCurrency('not-a-number')).toBe('$0.00');
  });
});

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatDate / formatDateTime', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2026-06-18T10:00:00Z')).toMatch(/Jun 18, 2026/);
  });

  it('includes the time in date-time output', () => {
    expect(formatDateTime('2026-06-18T10:00:00Z')).toMatch(/2026/);
  });
});

describe('initials', () => {
  it('takes the first letter of the first two words, uppercased', () => {
    expect(initials('Ada Lovelace')).toBe('AL');
    expect(initials('grace')).toBe('G');
    expect(initials('Katherine Johnson Smith')).toBe('KJ');
  });

  it('handles empty input', () => {
    expect(initials('')).toBe('');
  });
});
