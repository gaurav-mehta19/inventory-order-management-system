import { apiRequest } from '@/api/client';
import type { DashboardSummary } from '@/types/domain';

export function fetchDashboardSummary(signal?: AbortSignal) {
  return apiRequest<DashboardSummary>('/dashboard/summary', { signal });
}
