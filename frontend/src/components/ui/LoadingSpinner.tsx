import { Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <Loader2
        className={cn('h-5 w-5 animate-spin text-muted-foreground', className)}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
