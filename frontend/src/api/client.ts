import type { ApiErrorBody } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: string;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = body.error_code;
    this.fieldErrors = Object.fromEntries(
      (body.details?.fields ?? []).map((entry) => [entry.field, entry.message]),
    );
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.pathname + url.search;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, signal } = options;

  const response = await fetch(buildUrl(path, params), {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody: ApiErrorBody = payload ?? {
      success: false,
      message: 'Unexpected error',
      error_code: 'UNKNOWN',
    };
    throw new ApiError(response.status, errorBody);
  }

  return payload as T;
}
