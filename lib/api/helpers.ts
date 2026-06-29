import type { AxiosResponse } from "axios";
import type { ApiMeta, ApiResponse } from "./types";

export type PaginationParams = {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: ApiMeta;
};

export function toQueryParams(params?: Record<string, string | number | boolean | undefined | null>) {
  const out: Record<string, string> = {};
  if (!params) return out;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      out[key] = String(value);
    }
  }
  return out;
}

export function unwrapPaginated<T>(res: AxiosResponse<ApiResponse<T[]>>): PaginatedResult<T> {
  const meta = res.data.meta ?? { total: 0, page: 1, limit: 20 };
  return {
    items: res.data.data ?? [],
    meta: {
      total: meta.total ?? 0,
      page: meta.page ?? 1,
      limit: meta.limit ?? 20,
      totalPages: meta.totalPages,
    },
  };
}
