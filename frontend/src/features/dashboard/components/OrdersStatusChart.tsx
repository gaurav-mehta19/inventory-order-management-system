import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { EmptyState } from '@/components/ui/EmptyState';
import { STATUS_LABEL } from '@/features/orders/status';
import type { OrderStatus } from '@/types/domain';

interface OrdersStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

export function OrdersStatusChart({ data }: OrdersStatusChartProps) {
  if (data.length === 0) {
    return <EmptyState title="No orders yet" description="Order activity will appear here." />;
  }

  const points = data.map((point) => ({
    status: STATUS_LABEL[point.status as OrderStatus] ?? point.status,
    count: point.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={points} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="status"
          tickLine={false}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            color: 'hsl(var(--popover-foreground))',
            fontSize: '0.8125rem',
          }}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
