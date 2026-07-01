"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { filesService, sessionsService, speakerMaterialsService, speakersService } from "@/lib/api/services";
import { getAccessToken } from "@/lib/api/client";
import type {
  CreateSpeakerMaterialDto,
  UpdateSpeakerMaterialEquipmentDto,
} from "@/lib/api/dto";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useSpeakerDashboard() {
  const query = useQuery({
    queryKey: queryKeys.speakers.dashboard,
    queryFn: () => speakersService.getMyDashboard(),
    enabled: enabled(),
    staleTime: 60_000,
  });
  return { ...query, dashboard: query.data ?? null };
}

export function useSpeakerSession(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId ?? ""),
    queryFn: () => sessionsService.getById(sessionId!),
    enabled: enabled() && Boolean(sessionId),
    staleTime: 120_000,
  });
}

export function useSpeakerSessionMaterials(sessionId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.speakerMaterials.bySession(sessionId ?? ""),
    queryFn: () => speakerMaterialsService.listForSession(sessionId!),
    enabled: enabled() && Boolean(sessionId),
    staleTime: 30_000,
  });
  return { ...query, materials: query.data ?? [] };
}

export function useCreateSpeakerMaterial(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSpeakerMaterialDto) =>
      speakerMaterialsService.createForSession(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.speakerMaterials.bySession(sessionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.speakers.dashboard });
    },
  });
}

export function useUpdateSpeakerMaterialEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSpeakerMaterialEquipmentDto }) =>
      speakerMaterialsService.updateEquipment(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.speakerMaterials.bySession(data.sessionId) });
    },
  });
}

export function useUploadSpeakerDeck() {
  return useMutation({
    mutationFn: (file: File) => filesService.upload(file, "paper"),
  });
}
