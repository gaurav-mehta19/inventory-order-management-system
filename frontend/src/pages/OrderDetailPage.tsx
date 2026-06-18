import { ArrowLeft, Ban, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { useCancelOrder, useOrder, useUpdateOrderStatus } from '@/features/orders/hooks';
import { STATUS_LABEL } from '@/features/orders/status';
import { useToast } from '@/hooks/useToast';
import { ORDER_STATUSES, type OrderStatus } from '@/types/domain';
import { formatCurrency, formatDateTime, initials } from '@/utils/format';

export function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId ? Number(params.orderId) : undefined;
  const navigate = useNavigate();
  const toast = useToast();

  const orderQuery = useOrder(orderId);
  const statusMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!orderId) return;
    try {
      await statusMutation.mutateAsync({ id: orderId, status });
      toast.success('Status updated', `Order #${orderId} is now ${STATUS_LABEL[status]}.`);
    } catch (error) {
      toast.error(error, 'Unable to update status');
    }
  };

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      await cancelMutation.mutateAsync(orderId);
      setConfirmCancel(false);
      toast.success('Order cancelled', `Order #${orderId} was cancelled and stock restored.`);
    } catch (error) {
      toast.error(error, 'Unable to cancel order');
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" onClick={() => navigate('/orders')}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to orders
      </Button>

      {orderQuery.isError ? (
        <ErrorState error={orderQuery.error} onRetry={() => void orderQuery.refetch()} />
      ) : orderQuery.isLoading || !orderQuery.data ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : (
        <>
          <PageHeader
            title={`Order #${orderQuery.data.id}`}
            description={`Placed ${formatDateTime(orderQuery.data.created_at)}`}
            actions={<OrderStatusBadge status={orderQuery.data.status} />}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderQuery.data.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium">
                            {item.product?.name ?? `Product #${item.product_id}`}
                          </p>
                          {item.product ? (
                            <p className="font-mono text-xs text-muted-foreground">
                              {item.product.sku}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(item.line_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t border-border px-4 py-4">
                  <span className="text-sm font-medium">Order total</span>
                  <span className="text-lg font-semibold tabular-nums">
                    {formatCurrency(orderQuery.data.total_amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials(orderQuery.data.customer.full_name)}
                    </span>
                    <div>
                      <p className="font-medium">{orderQuery.data.customer.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Customer #{orderQuery.data.customer.id}
                      </p>
                    </div>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" aria-hidden />
                    {orderQuery.data.customer.email}
                  </p>
                  {orderQuery.data.customer.phone ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" aria-hidden />
                      {orderQuery.data.customer.phone}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={orderQuery.data.status}
                    onValueChange={(value) => void handleStatusChange(value as OrderStatus)}
                    disabled={statusMutation.isPending}
                  >
                    <SelectTrigger aria-label="Order status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {STATUS_LABEL[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {orderQuery.data.status !== 'cancelled' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Cancel order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Cancelling marks the order as cancelled and returns its items to stock.
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setConfirmCancel(true)}
                      disabled={cancelMutation.isPending}
                    >
                      <Ban className="h-4 w-4" aria-hidden />
                      Cancel order
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel order"
        description="This marks the order as cancelled and returns its items to stock. This cannot be undone."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        loading={cancelMutation.isPending}
        onConfirm={() => void handleCancel()}
      />
    </div>
  );
}
