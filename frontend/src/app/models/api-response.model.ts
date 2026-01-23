export interface ApiResponse<T> {
  data: T;
  success: boolean;      // Backend uses 'success'
  succeeded?: boolean;   // Alias for backwards compatibility
  errors: string[];
  message?: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
}
