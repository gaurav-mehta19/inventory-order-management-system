import { AlertTriangle, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { OrdersStatusChart } from '@/features/dashboard/components/OrdersStatusChart';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { useDashboardSummary } from '@/features/dashboard/hooks';
import { formatCurrency, formatNumber } from '@/utils/format';

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A real-time overview of your inventory and order activity."
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total products"
              value={data ? formatNumber(data.total_products) : '—'}
              icon={Package}
              loading={isLoading}
            />
            <StatCard
              label="Total customers"
              value={data ? formatNumber(data.total_customers) : '—'}
              icon={Users}
              loading={isLoading}
            />
            <StatCard
              label="Total orders"
              value={data ? formatNumber(data.total_orders) : '—'}
              icon={ShoppingCart}
              loading={isLoading}
            />
            <StatCard
              label="Revenue"
              value={data ? formatCurrency(data.total_revenue) : '—'}
              icon={DollarSign}
              tone="success"
              loading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Revenue trend</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !data ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : (
                  <RevenueChart data={data.revenue_trend} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders by status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !data ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : (
                  <OrdersStatusChart data={data.orders_by_status} />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Low stock products</CardTitle>
                {data ? (
                  <Badge variant={data.low_stock_count > 0 ? 'warning' : 'success'}>
                    {data.low_stock_count} item{data.low_stock_count === 1 ? '' : 's'}
                  </Badge>
                ) : null}
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/products?low_stock=1">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.low_stock_products.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Stock levels are healthy"
                  description={`No products at or below ${data.low_stock_threshold} units.`}
                />
              ) : (
                <ul className="divide-y divide-border">
                  {data.low_stock_products.map((product) => (
                    <li key={product.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                      <Badge variant={product.quantity_in_stock === 0 ? 'destructive' : 'warning'}>
                        {product.quantity_in_stock} in stock
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
