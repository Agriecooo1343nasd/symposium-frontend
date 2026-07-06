import type { AxiosResponse } from "axios";
import type { ApiMeta, ApiResponse } from "./types";

export const MAX_API_LIMIT = 100;

const PAGINATION_KEYS = new Set(["page", "limit", "sort", "search"]);

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

export function clampLimit(limit?: number, fallback = 20): number {
  if (limit === undefined || limit === null || Number.isNaN(limit)) return fallback;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_API_LIMIT);
}

export function toPaginationQuery(params?: PaginationParams) {
  const out: Record<string, string> = {};
  if (!params) return out;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.limit !== undefined) out.limit = String(clampLimit(params.limit));
  if (params.sort) out.sort = params.sort;
  if (params.search) out.search = params.search;
  return out;
}

export function toQueryParams(params?: Record<string, string | number | boolean | undefined | null>) {
  const out: Record<string, string> = {};
  if (!params) return out;
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = key === "limit" ? String(clampLimit(Number(value))) : String(value);
  }
  return out;
}

export function unwrapPaginated<T>(res: AxiosResponse<ApiResponse<T[]>>): PaginatedResult<T> {
  const meta = res.data.meta ?? { total: 0, page: 1, limit: 20 };
  const raw = res.data.data;

  let items: T[] = [];
  if (Array.isArray(raw)) {
    items = raw;
  } else if (raw && typeof raw === "object") {
    const record = raw as { rows?: unknown; items?: unknown; count?: number };
    if (Array.isArray(record.rows)) {
      items = record.rows as T[];
      if ((meta.total ?? 0) === 0 && typeof record.count === "number") {
        meta.total = record.count;
      }
    } else if (Array.isArray(record.items)) {
      items = record.items as T[];
    }
  }

  return {
    items,
    meta: {
      total: meta.total ?? items.length,
      page: meta.page ?? 1,
      limit: meta.limit ?? 20,
      totalPages: meta.totalPages,
    },
  };
}

/** Safe accessor — hooks should use this instead of `query.data?.items ?? []`. */
export function paginatedItems<T>(result: PaginatedResult<T> | undefined | null): T[] {
  const items = result?.items;
  return Array.isArray(items) ? items : [];
}

export async function fetchPaginatedList<T>(
  request: (pagination: PaginationParams) => Promise<PaginatedResult<T>>,
  options?: {
    pagination?: PaginationParams;
    match?: (item: T) => boolean;
  },
): Promise<PaginatedResult<T>> {
  const desired = options?.pagination?.limit ?? 20;
  const startPage = options?.pagination?.page ?? 1;
  const match = options?.match;
  const pageSize = MAX_API_LIMIT;

  if (!match && desired <= pageSize) {
    return request({
      page: startPage,
      limit: clampLimit(desired),
      sort: options?.pagination?.sort,
      search: options?.pagination?.search,
    });
  }

  const collected: T[] = [];
  let page = startPage;
  let lastMeta: ApiMeta = { total: 0, page: startPage, limit: pageSize };

  while (collected.length < desired) {
    const res = await request({
      page,
      limit: pageSize,
      sort: options?.pagination?.sort,
      search: options?.pagination?.search,
    });
    lastMeta = res.meta;
    const pageItems = paginatedItems(res);
    const batch = match ? pageItems.filter(match) : pageItems;
    collected.push(...batch);
    const totalPages =
      lastMeta.totalPages ?? Math.max(1, Math.ceil((lastMeta.total || 0) / pageSize));
    if (page >= totalPages || pageItems.length === 0) break;
    page += 1;
  }

  const resultItems = collected.slice(0, desired);
  return {
    items: resultItems,
    meta: {
      ...lastMeta,
      page: startPage,
      limit: resultItems.length,
    },
  };
}
