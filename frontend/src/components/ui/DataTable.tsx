import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

import type { SortDirection } from '@/types/api';
import { cn } from '@/utils/cn';

import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Skeleton } from './Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  sort?: { sortBy: string; order: SortDirection };
  onSortChange?: (sortBy: string) => void;
  emptyState?: ReactNode;
  skeletonRows?: number;
}

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  onRowClick,
  sort,
  onSortChange,
  emptyState,
  skeletonRows = 6,
}: DataTableProps<T>) {
  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!isLoading && data.length === 0) {
    return <>{emptyState ?? <EmptyState title="No records found" />}</>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => {
              const isActive = sort?.sortBy === column.key;
              return (
                <TableHead
                  key={column.key}
                  className={cn(alignClass[column.align ?? 'left'], column.className)}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      {column.header}
                      {isActive ? (
                        sort?.order === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                  {columns.map((column) => (
                    <TableCell key={column.key} className={alignClass[column.align ?? 'left']}>
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(alignClass[column.align ?? 'left'], column.className)}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
