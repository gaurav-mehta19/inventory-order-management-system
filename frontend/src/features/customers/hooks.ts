import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import type { ListQuery } from '@/types/api';

import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
  type CustomerPayload,
} from './api';

export function useCustomers(params: Partial<ListQuery>) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: ({ signal }) => fetchCustomers(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CustomerPayload> }) =>
      updateCustomer(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
