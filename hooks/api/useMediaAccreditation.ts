"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { cmsService } from "@/lib/api/services";
import { getAccessToken } from "@/lib/api/client";
import type {
  CreateMediaAccreditationAdminDto,
  MediaAccreditationStatus,
  UpdateMediaAccreditationDto,
} from "@/lib/api/dto";
import {
  createMediaAccreditationAsAdmin,
  updateMediaAccreditationAsAdmin,
} from "@/lib/media-accreditation-admin";
import {
  getMockMediaAccreditation,
  mergeMediaAccreditations,
} from "@/lib/media-accreditation-admin-mock";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useMediaAccreditations(params?: { status?: MediaAccreditationStatus; limit?: number }) {
  const query = useQuery({
    queryKey: queryKeys.cms.mediaAccreditations(params),
    queryFn: async () => {
      const page = await cmsService.listMediaAccreditations({ ...params, limit: params?.limit ?? 200 });
      const merged = mergeMediaAccreditations(page.items);
      const filtered = params?.status ? merged.filter((a) => a.status === params.status) : merged;
      return { ...page, items: filtered };
    },
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, accreditations: query.data?.items ?? [] };
}

export function useMediaAccreditation(id: string) {
  const list = useMediaAccreditations({ limit: 200 });
  const fromList = list.accreditations.find((a) => a.id === id);
  const detail = useQuery({
    queryKey: ["cms", "media-accreditation", id],
    queryFn: async () => {
      if (fromList) return fromList;
      const mock = getMockMediaAccreditation(id);
      if (mock) return mock;
      const page = await cmsService.listMediaAccreditations({ limit: 200 });
      const merged = mergeMediaAccreditations(page.items);
      return merged.find((a) => a.id === id) ?? null;
    },
    enabled: enabled() && Boolean(id),
    staleTime: 30_000,
  });
  return {
    ...detail,
    accreditation: detail.data ?? fromList ?? null,
    isLoading: list.isLoading || detail.isLoading,
  };
}

export function useMediaAccreditationStats() {
  return useQuery({
    queryKey: queryKeys.cms.mediaAccreditationStats,
    queryFn: () => cmsService.getMediaAccreditationStats(),
    enabled: enabled(),
    staleTime: 60_000,
  });
}

export function useUpdateMediaAccreditation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMediaAccreditationDto }) =>
      updateMediaAccreditationAsAdmin(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms"] });
    },
  });
}

export function useCreateMediaAccreditationAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMediaAccreditationAdminDto) => createMediaAccreditationAsAdmin(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms"] });
    },
  });
}
