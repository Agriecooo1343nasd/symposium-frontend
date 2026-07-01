"use client";

import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { usersService } from "@/lib/api/services";
import type { UserDto } from "@/lib/api/dto";
import { getAccessToken } from "@/lib/api/client";

export function useUsersLookup(userIds: string[]) {
  const unique = [...new Set(userIds.filter(Boolean))];
  const canFetch = typeof window !== "undefined" && Boolean(getAccessToken());

  const queries = useQueries({
    queries: unique.map((id) => ({
      queryKey: queryKeys.users.detail(id),
      queryFn: () => usersService.getById(id),
      staleTime: 5 * 60_000,
      enabled: canFetch,
    })),
  });

  const usersById = new Map<string, UserDto>();
  for (const query of queries) {
    if (query.data) usersById.set(query.data.id, query.data);
  }

  return {
    usersById,
    isLoading: queries.some((q) => q.isLoading),
  };
}
