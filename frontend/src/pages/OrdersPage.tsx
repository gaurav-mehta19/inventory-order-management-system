import { Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { useOrders } from '@/features/orders/hooks';
import { STATUS_LABEL } from '@/features/orders/status';
import { useListQuery } from '@/hooks/useListQuery';
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/types/domain';
import { formatCurrency, formatDateTime } from '@/utils/format';

const ALL = 'all';

export function OrdersPage() {
  const navigate = useNavigate();
  const { query, sort, setPage, toggleSort } = useListQuery({
    initialSortBy: 'created_at',
    initialOrder: 'desc',
  });
  const [status, setStatus] = useState<OrderStatus | typeof ALL>(ALL);

  const ordersQuery = useOrders({
    ...query,
    status: status === ALL ? undefined : status,
  });

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order',
      sortable: true,
      render: (order) => <span className="font-medium">#{order.id}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      render: (order) => (
        <span className="text-muted-foreground">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} units · {order.items.length}{' '}
          line{order.items.length === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total',
      sortable: true,
      align: 'right',
      render: (order) => (
        <span className="font-medium tabular-nums">{formatCurrency(order.total_amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: 'created_at',
      header: 'Placed',
      sortable: true,
      render: (order) => (
        <span className="text-muted-foreground">{formatDateTime(order.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track and fulfil customer orders."
        actions={
          <Button onClick={() => navigate('/orders/new')}>
            <Plus className="h-4 w-4" aria-hidden />
            New order
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as OrderStatus | typeof ALL);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {ORDER_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={ordersQuery.data?.items ?? []}
        rowKey={(order) => order.id}
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
        error={ordersQuery.error}
        onRetry={() => void ordersQuery.refetch()}
        sort={sort}
        onSortChange={toggleSort}
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
        emptyState={
          <EmptyState
            icon={ShoppingCart}
            title={status === ALL ? 'No orders yet' : 'No orders with this status'}
            description={
              status === ALL
                ? 'Create your first order to see it here.'
                : 'Try selecting a different status.'
            }
            action={
              status === ALL ? (
                <Button onClick={() => navigate('/orders/new')}>
                  <Plus className="h-4 w-4" aria-hidden />
                  New order
                </Button>
              ) : undefined
            }
          />
        }
      />

      {ordersQuery.data && ordersQuery.data.items.length > 0 ? (
        <Pagination meta={ordersQuery.data.meta} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
