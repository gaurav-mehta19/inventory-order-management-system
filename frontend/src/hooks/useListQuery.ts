import { useCallback, useMemo, useState } from 'react';

import type { SortDirection } from '@/types/api';

import { useDebouncedValue } from './useDebouncedValue';

interface UseListQueryOptions {
  initialSortBy?: string;
  initialOrder?: SortDirection;
  initialPageSize?: number;
}

export function useListQuery({
  initialSortBy = 'created_at',
  initialOrder = 'desc',
  initialPageSize = 10,
}: UseListQueryOptions = {}) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [order, setOrder] = useState<SortDirection>(initialOrder);

  const debouncedSearch = useDebouncedValue(search.trim());

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: string) => {
      setPage(1);
      if (sortBy === field) {
        setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setOrder('asc');
      }
    },
    [sortBy],
  );

  const query = useMemo(
    () => ({
      page,
      page_size: pageSize,
      sort_by: sortBy,
      order,
      search: debouncedSearch || undefined,
    }),
    [page, pageSize, sortBy, order, debouncedSearch],
  );

  return {
    query,
    search,
    sort: { sortBy, order },
    setPage,
    onSearchChange,
    toggleSort,
  };
}
