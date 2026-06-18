import { toast } from 'sonner';

import { ApiError } from '@/api/client';

export function resolveErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function useToast() {
  return {
    success: (message: string, description?: string) => toast.success(message, { description }),
    error: (error: unknown, fallback?: string) => toast.error(resolveErrorMessage(error, fallback)),
    info: (message: string, description?: string) => toast(message, { description }),
  };
}
