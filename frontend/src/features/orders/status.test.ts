import { describe, expect, it } from 'vitest';

import { ORDER_STATUSES } from '@/types/domain';

import { STATUS_LABEL, STATUS_VARIANT } from './status';

describe('order status maps', () => {
  it('has a label and badge variant for every status', () => {
    for (const status of ORDER_STATUSES) {
      expect(STATUS_LABEL[status]).toBeTruthy();
      expect(STATUS_VARIANT[status]).toBeTruthy();
    }
  });

  it('maps delivered to success and cancelled to destructive', () => {
    expect(STATUS_VARIANT.delivered).toBe('success');
    expect(STATUS_VARIANT.cancelled).toBe('destructive');
  });
});
