import { apiRequest } from '@/api/client';
import type { ListQuery, MessageResponse, Page } from '@/types/api';
import type { Product } from '@/types/domain';

export type ProductListParams = Partial<ListQuery> & {
  low_stock_threshold?: number;
};

export interface ProductPayload {
  name: string;
  sku: string;
  price: string;
  quantity_in_stock: number;
}

export function fetchProducts(params: ProductListParams, signal?: AbortSignal) {
  return apiRequest<Page<Product>>('/products', { params, signal });
}

export function fetchProduct(id: number, signal?: AbortSignal) {
  return apiRequest<Product>(`/products/${id}`, { signal });
}

export function createProduct(payload: ProductPayload) {
  return apiRequest<Product>('/products', { method: 'POST', body: payload });
}

export function updateProduct(id: number, payload: Partial<ProductPayload>) {
  return apiRequest<Product>(`/products/${id}`, { method: 'PATCH', body: payload });
}

export function deleteProduct(id: number) {
  return apiRequest<MessageResponse>(`/products/${id}`, { method: 'DELETE' });
}
