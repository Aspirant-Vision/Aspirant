/**
 * Standardized API & Service Response Contracts
 * Guarantees uniform error and data envelopes across all backend services.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    timestamp?: string;
  };
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  field?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
