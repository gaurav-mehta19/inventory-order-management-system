import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

import { toast } from 'sonner';

import { resolveErrorMessage, useToast } from './useToast';

describe('resolveErrorMessage', () => {
  it('reads the message from an ApiError', () => {
    const error = new ApiError(404, { success: false, message: 'gone', error_code: 'NOT_FOUND' });
    expect(resolveErrorMessage(error)).toBe('gone');
  });

  it('reads the message from a generic Error', () => {
    expect(resolveErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('uses the fallback for unknown values', () => {
    expect(resolveErrorMessage('weird', 'fallback')).toBe('fallback');
  });
});

describe('useToast', () => {
  it('delegates success, error and info to sonner', () => {
    const t = useToast();

    t.success('Saved', 'desc');
    expect(toast.success).toHaveBeenCalledWith('Saved', { description: 'desc' });

    t.error(new Error('nope'));
    expect(toast.error).toHaveBeenCalledWith('nope');

    t.info('Heads up', 'detail');
    expect(toast).toHaveBeenCalledWith('Heads up', { description: 'detail' });
  });
});
