import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { PageMeta } from '@/types/api';

import { Button } from './Button';

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, total_pages, total_items, page_size } = meta;
  const firstItem = total_items === 0 ? 0 : (page - 1) * page_size + 1;
  const lastItem = Math.min(page * page_size, total_items);

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{firstItem}</span>–
        <span className="font-medium text-foreground">{lastItem}</span> of{' '}
        <span className="font-medium text-foreground">{total_items}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Button>
        <span className="px-2 text-sm text-muted-foreground">
          Page {page} of {Math.max(total_pages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
