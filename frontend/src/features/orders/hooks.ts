import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import type { OrderStatus } from '@/types/domain';

import {
  createOrder,
  fetchOrder,
  fetchOrders,
  updateOrderStatus,
  type OrderListParams,
  type OrderPayload,
} from './api';

export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: ({ signal }) => fetchOrders(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? 0),
    queryFn: ({ signal }) => fetchOrder(id as number, signal),
    enabled: id !== undefined,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderPayload) => createOrder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
