"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { programmeService } from "@/lib/api/services";
import type { UpdateVenueRoomDto, UpsertVenueRoomDto } from "@/lib/api/dto";
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
