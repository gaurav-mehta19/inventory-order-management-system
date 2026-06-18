import type { BadgeProps } from '@/components/ui/Badge';
import type { OrderStatus } from '@/types/domain';

export const STATUS_VARIANT: Record<OrderStatus, NonNullable<BadgeProps['variant']>> = {
  pending: 'warning',
  confirmed: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
