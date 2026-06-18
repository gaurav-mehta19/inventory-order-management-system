import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import type { Product } from '@/types/domain';

import {
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProducts,
  updateProduct,
  type ProductListParams,
  type ProductPayload,
} from './api';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: ({ signal }) => fetchProducts(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? 0),
    queryFn: ({ signal }) => fetchProduct(id as number, signal),
    enabled: id !== undefined,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ProductPayload> }) =>
      updateProduct(id, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(product.id), product);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function isLowStock(product: Product, threshold = 10): boolean {
  return product.quantity_in_stock <= threshold;
}
