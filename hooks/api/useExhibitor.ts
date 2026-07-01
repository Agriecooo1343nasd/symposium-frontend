"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { exhibitorsService, filesService, sponsorsService } from "@/lib/api/services";
import { getAccessToken } from "@/lib/api/client";
import type {
  CreateExhibitorMaterialDto,
  CreateExhibitorStaffPassDto,
  ScanExhibitorLeadDto,
  UpdateExhibitorProfileDto,
} from "@/lib/api/dto";
import { deriveExhibitorParticipation } from "@/lib/exhibitor/participation";
import { useSymposiumId } from "./useSymposium";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useExhibitorProfile() {
  const query = useQuery({
    queryKey: queryKeys.exhibitors.me,
    queryFn: () => exhibitorsService.getMyProfile(),
    enabled: enabled(),
    staleTime: 60_000,
    retry: false,
  });
  const profile = query.data ?? null;
  return {
    ...query,
    profile,
    participation: deriveExhibitorParticipation(profile),
    isSponsor: Boolean(profile?.sponsorId),
  };
}

export function useUpdateExhibitorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateExhibitorProfileDto) => exhibitorsService.updateMyProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useExhibitorMaterials() {
  const query = useQuery({
    queryKey: queryKeys.exhibitors.materials,
    queryFn: () => exhibitorsService.listMyMaterials(),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, materials: query.data ?? [] };
}

export function useAddExhibitorMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExhibitorMaterialDto) => exhibitorsService.addMaterial(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.materials });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useRemoveExhibitorMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exhibitorsService.removeMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.materials });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useExhibitorStaffPasses() {
  const query = useQuery({
    queryKey: queryKeys.exhibitors.staffPasses,
    queryFn: () => exhibitorsService.listStaffPasses(),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, passes: query.data ?? [] };
}

export function useCreateExhibitorStaffPass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExhibitorStaffPassDto) => exhibitorsService.createStaffPass(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.staffPasses });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useRemoveExhibitorStaffPass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exhibitorsService.removeStaffPass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.staffPasses });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useScanExhibitorLead() {
  return useMutation({
    mutationFn: (dto: ScanExhibitorLeadDto) => exhibitorsService.scanLead(dto),
  });
}

export function useUploadExhibitorMaterial() {
  return useMutation({
    mutationFn: (file: File) => filesService.upload(file, "exhibitor_material"),
  });
}

export function useLinkedSponsor(sponsorId: string | null | undefined) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.sponsors.bySymposium(symposiumId ?? ""),
    queryFn: () => sponsorsService.listBySymposium(symposiumId!),
    enabled: enabled() && Boolean(symposiumId) && Boolean(sponsorId),
    staleTime: 5 * 60_000,
  });
  const sponsor = query.data?.find((s) => s.id === sponsorId) ?? null;
  return { ...query, sponsor };
}
