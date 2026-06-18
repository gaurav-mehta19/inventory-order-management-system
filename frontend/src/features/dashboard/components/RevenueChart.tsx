import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/format';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: string; orders: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No revenue yet"
        description="Revenue will appear once orders are placed."
      />
    );
  }

  const points = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(point.revenue),
    orders: point.orders,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={points} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
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
          width={64}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            color: 'hsl(var(--popover-foreground))',
            fontSize: '0.8125rem',
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
