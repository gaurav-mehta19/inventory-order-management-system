import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';

import { fetchDashboardSummary } from './api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ({ signal }) => fetchDashboardSummary(signal),
    staleTime: 15_000,
  });
}
