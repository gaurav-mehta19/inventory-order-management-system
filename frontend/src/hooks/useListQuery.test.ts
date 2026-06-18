import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useListQuery } from './useListQuery';

describe('useListQuery', () => {
  it('exposes sensible defaults', () => {
    const { result } = renderHook(() => useListQuery());
    expect(result.current.query.page).toBe(1);
    expect(result.current.sort).toEqual({ sortBy: 'created_at', order: 'desc' });
  });

  it('flips order on the same field and switches field otherwise', () => {
    const { result } = renderHook(() =>
      useListQuery({ initialSortBy: 'name', initialOrder: 'asc' }),
    );

    act(() => result.current.toggleSort('name'));
    expect(result.current.sort).toEqual({ sortBy: 'name', order: 'desc' });

    act(() => result.current.toggleSort('price'));
    expect(result.current.sort).toEqual({ sortBy: 'price', order: 'asc' });
  });

  it('resets to page 1 when the search term changes', () => {
    const { result } = renderHook(() => useListQuery());

    act(() => result.current.setPage(3));
    expect(result.current.query.page).toBe(3);

    act(() => result.current.onSearchChange('abc'));
    expect(result.current.query.page).toBe(1);
    expect(result.current.search).toBe('abc');
  });
});
