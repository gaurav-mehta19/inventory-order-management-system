import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiRequest } from './client';

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiRequest', () => {
  it('returns parsed JSON on success', async () => {
    global.fetch = mockFetch(200, { id: 1 }) as unknown as typeof fetch;
    await expect(apiRequest('/products/1')).resolves.toEqual({ id: 1 });
  });

  it('builds query params and forwards method/body', async () => {
    const fetchMock = mockFetch(201, { ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiRequest('/products', {
      method: 'POST',
      body: { a: 1 },
      params: { page: 2, q: undefined, empty: '' },
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/products?page=2');
    expect(url).not.toContain('q=');
    expect(url).not.toContain('empty=');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it('returns undefined for 204 No Content', async () => {
    global.fetch = mockFetch(204, null) as unknown as typeof fetch;
    await expect(apiRequest('/x', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws ApiError with mapped field errors on validation failure', async () => {
    global.fetch = mockFetch(422, {
      success: false,
      message: 'bad',
      error_code: 'VALIDATION_ERROR',
      details: { fields: [{ field: 'sku', message: 'required' }] },
    }) as unknown as typeof fetch;

    await expect(apiRequest('/products', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 422,
      errorCode: 'VALIDATION_ERROR',
      fieldErrors: { sku: 'required' },
    });
  });

  it('throws an ApiError instance for non-2xx responses', async () => {
    global.fetch = mockFetch(404, {
      success: false,
      message: 'nope',
      error_code: 'NOT_FOUND',
    }) as unknown as typeof fetch;

    const error = await apiRequest('/x').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe('nope');
  });
});
