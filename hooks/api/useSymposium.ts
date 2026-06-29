"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { DEFAULT_SYMPOSIUM_SLUG } from "@/lib/api/constants";
import { queryKeys } from "@/lib/api/query-keys";
import { symposiumsService } from "@/lib/api/services";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSymposium, setSymposiumError, setSymposiumLoading } from "@/store/slices/symposiumSlice";

export function useSymposium(slug: string = DEFAULT_SYMPOSIUM_SLUG) {
  const dispatch = useAppDispatch();
  const symposiumState = useAppSelector((s) => s.symposium);

  const query = useQuery({
    queryKey: queryKeys.symposium.bySlug(slug),
    queryFn: () => symposiumsService.getBySlug(slug),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.isLoading) dispatch(setSymposiumLoading());
  }, [query.isLoading, dispatch]);

  useEffect(() => {
    if (query.data) {
      dispatch(setSymposium({ slug, symposium: query.data }));
    }
  }, [query.data, slug, dispatch]);

  useEffect(() => {
    if (query.error) {
      const message = query.error instanceof Error ? query.error.message : "Failed to load symposium";
      dispatch(setSymposiumError(message));
    }
  }, [query.error, dispatch]);

  return {
    ...query,
    slug,
    symposiumId: symposiumState.id ?? query.data?.id ?? null,
    symposium: symposiumState.symposium ?? query.data ?? null,
    status: symposiumState.status,
  };
}

export function useSymposiumId(slug: string = DEFAULT_SYMPOSIUM_SLUG): string | null {
  const { symposiumId } = useSymposium(slug);
  return symposiumId;
}
