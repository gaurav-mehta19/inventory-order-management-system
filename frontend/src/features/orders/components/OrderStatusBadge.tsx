import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/types/domain';

import { STATUS_LABEL, STATUS_VARIANT } from '../status';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
