import { AlertTriangle } from 'lucide-react';

import { ApiError } from '@/api/client';

import { Button } from './Button';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

const WAKING_MESSAGE = 'The server is waking up — this can take up to a minute. Please try again.';

function resolveMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 502 || error.status === 503 || error.status === 504) {
      return WAKING_MESSAGE;
    }
    return error.message;
  }
  if (error instanceof TypeError) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong while loading data.';
}

export function ErrorState({ error, onRetry, title = 'Unable to load data' }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{resolveMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
