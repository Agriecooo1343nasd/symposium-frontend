"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { announcementsService } from "@/lib/api/services";
import type {
  UpdateSymposiumArchiveItemDto,
  UpsertSymposiumArchiveItemDto,
} from "@/lib/api/dto";
import { toArchiveDoc, toGalleryPhoto } from "@/lib/archive-mapping";
import { useSymposiumId } from "./useSymposium";

export function usePublicArchive(symposiumIdOverride?: string | null) {
  const contextId = useSymposiumId();
  const symposiumId = symposiumIdOverride ?? contextId;
  const query = useQuery({
    queryKey: queryKeys.archive.public(symposiumId ?? "none"),
    queryFn: () => announcementsService.listArchivePublic(symposiumId as string),
    enabled: Boolean(symposiumId),
    staleTime: 5 * 60_000,
  });
  const items = query.data ?? [];
  return {
    ...query,
    photos: items.filter((i) => i.itemType === "photo").map(toGalleryPhoto),
    documents: items.filter((i) => i.itemType === "document").map(toArchiveDoc),
  };
}

export function useAdminArchive() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.archive.admin(symposiumId ?? "none"),
    queryFn: () => announcementsService.listArchiveAdmin(symposiumId as string),
    enabled: Boolean(symposiumId),
    staleTime: 60_000,
  });
  const items = query.data ?? [];
  return {
    ...query,
    photos: items.filter((i) => i.itemType === "photo").map(toGalleryPhoto),
    documents: items.filter((i) => i.itemType === "document").map(toArchiveDoc),
  };
}

function useInvalidateArchive() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return () => {
    if (symposiumId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.archive.admin(symposiumId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.archive.public(symposiumId) });
    }
  };
}

export function useCreateArchiveItem() {
  const invalidate = useInvalidateArchive();
  return useMutation({
    mutationFn: (dto: UpsertSymposiumArchiveItemDto) => announcementsService.createArchiveItem(dto),
    onSuccess: invalidate,
  });
}

export function useUpdateArchiveItem() {
  const invalidate = useInvalidateArchive();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSymposiumArchiveItemDto }) =>
      announcementsService.updateArchiveItem(id, dto),
    onSuccess: invalidate,
  });
}

export function useDeleteArchiveItem() {
  const invalidate = useInvalidateArchive();
  return useMutation({
    mutationFn: (id: string) => announcementsService.removeArchiveItem(id),
    onSuccess: invalidate,
  });
}
