"use client";

import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

type Options<T> = {
  items: T[];
  pageSize?: number;
  filterFn?: (item: T, query: string) => boolean;
  sortFn?: (a: T, b: T, sortKey: string, dir: SortDir) => number;
  initialSortKey?: string;
  initialSortDir?: SortDir;
};

export function usePagedList<T>({
  items,
  pageSize: defaultPageSize = 9,
  filterFn,
  sortFn,
  initialSortKey = "",
  initialSortDir = "asc",
}: Options<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !filterFn) return items;
    return items.filter((item) => filterFn(item, q));
  }, [items, query, filterFn]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortFn) return filtered;
    return [...filtered].sort((a, b) => sortFn(a, b, sortKey, sortDir));
  }, [filtered, sortKey, sortDir, sortFn]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  const setQueryAndReset = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const setSort = (key: string, dir?: SortDir) => {
    setSortKey(key);
    if (dir) setSortDir(dir);
    setPage(1);
  };

  const setPageSizeAndReset = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    query,
    setQuery: setQueryAndReset,
    sortKey,
    sortDir,
    setSort,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: setPageSizeAndReset,
    total: sorted.length,
    totalPages,
    pageItems,
    filteredCount: sorted.length,
  };
}
