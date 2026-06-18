import { apiRequest } from '@/api/client';
import type { ListQuery, MessageResponse, Page } from '@/types/api';
import type { Customer } from '@/types/domain';

export interface CustomerPayload {
  full_name: string;
  email: string;
  phone?: string | null;
}

export function fetchCustomers(params: Partial<ListQuery>, signal?: AbortSignal) {
  return apiRequest<Page<Customer>>('/customers', { params, signal });
}

export function fetchCustomer(id: number, signal?: AbortSignal) {
  return apiRequest<Customer>(`/customers/${id}`, { signal });
}

export function createCustomer(payload: CustomerPayload) {
  return apiRequest<Customer>('/customers', { method: 'POST', body: payload });
}

export function updateCustomer(id: number, payload: Partial<CustomerPayload>) {
  return apiRequest<Customer>(`/customers/${id}`, { method: 'PATCH', body: payload });
}

export function deleteCustomer(id: number) {
  return apiRequest<MessageResponse>(`/customers/${id}`, { method: 'DELETE' });
}
