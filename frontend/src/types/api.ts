export interface PageMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error_code: string;
  details?: {
    fields?: Array<{ field: string; message: string }>;
    [key: string]: unknown;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export type SortDirection = 'asc' | 'desc';

export type ListQuery = {
  page: number;
  page_size: number;
  sort_by: string;
  order: SortDirection;
  search?: string;
};

export type QueryParams = Record<string, string | number | undefined | null>;
