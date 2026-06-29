export type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: ApiMeta;
  message?: string;
  path?: string;
  timestamp?: string;
};

export type ApiErrorBody = {
  success?: boolean;
  message?: string | string[];
  data?: unknown;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
