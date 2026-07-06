"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { boothsService } from "@/lib/api/services";
import type { UpdateExhibitionBoothDto, UpsertExhibitionBoothDto } from "@/lib/api/dto";
import { useSymposiumId } from "./useSymposium";

export function useBooths(symposiumIdOverride?: string | null) {
  const contextId = useSymposiumId();
  const symposiumId = symposiumIdOverride ?? contextId;
  const query = useQuery({
    queryKey: queryKeys.booths.bySymposium(symposiumId ?? "none"),
    queryFn: () => boothsService.listBySymposium(symposiumId as string),
    enabled: Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, booths: query.data ?? [] };
}

function useInvalidateBooths() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return () => {
    if (symposiumId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.booths.bySymposium(symposiumId) });
    }
  };
}

export function useCreateBooth() {
  const invalidate = useInvalidateBooths();
  return useMutation({
    mutationFn: (dto: UpsertExhibitionBoothDto) => boothsService.create(dto),
    onSuccess: invalidate,
  });
}

export function useUpdateBooth() {
  const invalidate = useInvalidateBooths();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExhibitionBoothDto }) =>
      boothsService.update(id, dto),
    onSuccess: invalidate,
  });
}

export function useDeleteBooth() {
  const invalidate = useInvalidateBooths();
  return useMutation({
    mutationFn: (id: string) => boothsService.remove(id),
    onSuccess: invalidate,
  });
}
