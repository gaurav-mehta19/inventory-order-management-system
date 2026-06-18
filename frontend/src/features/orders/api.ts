import { apiRequest } from '@/api/client';
import type { ListQuery, Page } from '@/types/api';
import type { Order, OrderDetail, OrderStatus } from '@/types/domain';

export type OrderListParams = Partial<ListQuery> & {
  status?: OrderStatus;
  customer_id?: number;
};

export interface OrderItemPayload {
  product_id: number;
  quantity: number;
}

export interface OrderPayload {
  customer_id: number;
  items: OrderItemPayload[];
}

export function fetchOrders(params: OrderListParams, signal?: AbortSignal) {
  return apiRequest<Page<Order>>('/orders', { params, signal });
}

export function fetchOrder(id: number, signal?: AbortSignal) {
  return apiRequest<OrderDetail>(`/orders/${id}`, { signal });
}

export function createOrder(payload: OrderPayload) {
  return apiRequest<OrderDetail>('/orders', { method: 'POST', body: payload });
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return apiRequest<OrderDetail>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}
