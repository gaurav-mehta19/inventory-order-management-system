import type { ListQuery } from '@/types/api';

export const queryKeys = {
  dashboard: ['dashboard', 'summary'] as const,
  products: {
    all: ['products'] as const,
    list: (query: Partial<ListQuery> & { low_stock_threshold?: number }) =>
      ['products', 'list', query] as const,
    detail: (id: number) => ['products', 'detail', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (query: Partial<ListQuery>) => ['customers', 'list', query] as const,
    detail: (id: number) => ['customers', 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (query: Partial<ListQuery> & { status?: string; customer_id?: number }) =>
      ['orders', 'list', query] as const,
    detail: (id: number) => ['orders', 'detail', id] as const,
  },
};
