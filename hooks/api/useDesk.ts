"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
  attendanceService,
  cmsService,
  registrationsService,
  submissionsService,
} from "@/lib/api/services";
import { registrationStatusLabel } from "@/lib/api/mappers/registration-helpers";
import { getAccessToken } from "@/lib/api/client";
import type {
  ManualCheckInDto,
  MediaAccreditationStatus,
  QrCheckInDto,
  RegistrationStatus,
  SubmissionDecisionDto,
  VerifyChecklistDto,
  UpdateMediaAccreditationDto,
} from "@/lib/api/dto";
import { useSymposiumId } from "./useSymposium";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useDeskRegistrations(params?: {
  page?: number;
  limit?: number;
  status?: RegistrationStatus;
}) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.registrations.admin({ ...params, symposiumId }),
    queryFn: () =>
      registrationsService.listAdmin({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 50,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
  return { ...query, registrations: query.data?.items ?? [], meta: query.data?.meta };
}

export function useDeskRegistration(id: string) {
  const query = useQuery({
    queryKey: queryKeys.registrations.detail(id),
    queryFn: () => registrationsService.getById(id),
    enabled: enabled() && Boolean(id),
  });
  return { ...query, registration: query.data };
}

export function useRegistrationAttendance(registrationId: string) {
  return useQuery({
    queryKey: queryKeys.attendance.history(registrationId),
    queryFn: () => attendanceService.getHistory(registrationId),
    enabled: enabled() && Boolean(registrationId),
    staleTime: 30_000,
  });
}

export function usePendingVerifications() {
  const query = useQuery({
    queryKey: queryKeys.attendance.pending,
    queryFn: () => attendanceService.getPendingVerifications(),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, items: query.data ?? [] };
}

export function useApproveVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationId: string) => registrationsService.approve(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

export function useVerifyRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: VerifyChecklistDto }) =>
      attendanceService.verifyChecklist(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

export function useQrCheckIn() {
  return useMutation({
    mutationFn: (dto: QrCheckInDto) => attendanceService.checkInQr(dto),
  });
}

export function useManualCheckIn() {
  return useMutation({
    mutationFn: (dto: ManualCheckInDto) => attendanceService.checkInManual(dto),
  });
}

export function useAdminSubmissions(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.submissions.admin({ ...params, symposiumId }),
    queryFn: () =>
      submissionsService.listAdmin({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 50,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
  return { ...query, submissions: query.data?.items ?? [] };
}

export function useSubmissionDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.submissions.detail(id),
    queryFn: () => submissionsService.getById(id),
    enabled: enabled() && Boolean(id),
  });
}

export function useSubmissionDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SubmissionDecisionDto }) =>
      submissionsService.recordDecision(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useMediaAccreditations(params?: { status?: MediaAccreditationStatus; limit?: number }) {
  const query = useQuery({
    queryKey: queryKeys.cms.mediaAccreditations(params),
    queryFn: () => cmsService.listMediaAccreditations({ ...params, limit: params?.limit ?? 50 }),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, accreditations: query.data?.items ?? [] };
}

export function useMediaAccreditation(id: string) {
  const list = useMediaAccreditations({ limit: 100 });
  const fromList = list.accreditations.find((a) => a.id === id);
  const detail = useQuery({
    queryKey: ["cms", "media-accreditation", id],
    queryFn: async () => {
      if (fromList) return fromList;
      const page = await cmsService.listMediaAccreditations({ limit: 100 });
      return page.items.find((a) => a.id === id) ?? null;
    },
    enabled: enabled() && Boolean(id),
    staleTime: 30_000,
  });
  return { ...detail, accreditation: detail.data ?? fromList ?? null, isLoading: list.isLoading || detail.isLoading };
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
      cmsService.updateMediaAccreditation(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms"] });
    },
  });
}

export { registrationStatusLabel };
