import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

import { Card } from './Card';
import { Skeleton } from './Skeleton';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
  loading?: boolean;
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'default',
  loading = false,
}: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          )}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span
          className={cn('flex h-11 w-11 items-center justify-center rounded-lg', toneClasses[tone])}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}
