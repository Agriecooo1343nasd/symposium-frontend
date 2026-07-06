"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { programmeService } from "@/lib/api/services";
import type {
  ReorderRunOfShowDto,
  UpdateRunOfShowItemDto,
  UpdateVenueRoomDto,
  UpsertRunOfShowItemDto,
  UpsertVenueRoomDto,
} from "@/lib/api/dto";
import { useSymposiumId } from "./useSymposium";

export function useRooms() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.programme.rooms(symposiumId ?? "none"),
    queryFn: () => programmeService.listRooms(symposiumId as string),
    enabled: Boolean(symposiumId),
    staleTime: 5 * 60_000,
  });
  return { ...query, rooms: query.data ?? [] };
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: (dto: UpsertVenueRoomDto) => programmeService.createRoom(dto),
    onSuccess: () => {
      if (symposiumId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.programme.rooms(symposiumId) });
      }
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateVenueRoomDto }) =>
      programmeService.updateRoom(id, dto),
    onSuccess: () => {
      if (symposiumId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.programme.rooms(symposiumId) });
      }
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: (id: string) => programmeService.removeRoom(id),
    onSuccess: () => {
      if (symposiumId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.programme.rooms(symposiumId) });
      }
    },
  });
}

function invalidateRunOfShow(queryClient: ReturnType<typeof useQueryClient>, symposiumId: string) {
  queryClient.invalidateQueries({ queryKey: ["programme", "run-of-show", symposiumId] });
}

export function useRunOfShow(day?: number, options?: { enabled?: boolean }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.programme.runOfShow(symposiumId ?? "none", day),
    queryFn: () => programmeService.listRunOfShow(symposiumId as string, day),
    enabled: (options?.enabled ?? true) && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, items: query.data ?? [] };
}

export function useCreateRunOfShowItem() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: (dto: UpsertRunOfShowItemDto) => programmeService.createRunOfShowItem(dto),
    onSuccess: () => {
      if (symposiumId) invalidateRunOfShow(queryClient, symposiumId);
    },
  });
}

export function useUpdateRunOfShowItem() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRunOfShowItemDto }) =>
      programmeService.updateRunOfShowItem(id, dto),
    onSuccess: () => {
      if (symposiumId) invalidateRunOfShow(queryClient, symposiumId);
    },
  });
}

export function useDeleteRunOfShowItem() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: (id: string) => programmeService.removeRunOfShowItem(id),
    onSuccess: () => {
      if (symposiumId) invalidateRunOfShow(queryClient, symposiumId);
    },
  });
}

export function useReorderRunOfShow() {
  const queryClient = useQueryClient();
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: (dto: ReorderRunOfShowDto) => programmeService.reorderRunOfShow(dto),
    onSuccess: () => {
      if (symposiumId) invalidateRunOfShow(queryClient, symposiumId);
    },
  });
}
