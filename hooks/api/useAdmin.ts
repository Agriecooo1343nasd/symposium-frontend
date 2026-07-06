"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
  adminService,
  announcementsService,
  exhibitorsService,
  financeService,
  paymentsService,
  refundsService,
  registrationsService,
  reviewsService,
  rolesService,
  sessionsService,
  speakersService,
  ticketCategoriesService,
  usersService,
} from "@/lib/api/services";
import { submissionsService } from "@/lib/api/services/submissions";
import { getAccessToken } from "@/lib/api/client";
import type {
  AdminCreateGroupRegistrationDto,
  AdminCreateUserDto,
  AdminUpdateUserDto,
  AdminUpdateRegistrationDto,
  AdminUpdateRefundStatusDto,
  ConfirmManualPaymentDto,
  CreateAnnouncementDto,
  CreateExhibitorDto,
  CreateSessionDto,
  CreateSpeakerDto,
  CreateTicketCategoryDto,
  CreateTrackDto,
  DeskWalkInDto,
  RegistrationStatus,
  SubmissionDecisionDto,
  UpdateAnnouncementDto,
  UpdateExhibitorDto,
  UpdateSessionDto,
  UpdateSpeakerDto,
  UpdateTicketCategoryDto,
  UpdateTrackDto,
} from "@/lib/api/dto";
import { useSymposiumId } from "./useSymposium";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useAdminTicketCategories() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.ticketCategories.admin(symposiumId ?? ""),
    queryFn: () => ticketCategoriesService.listAdmin(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, categories: query.data ?? [] };
}

export function useCreateTicketCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTicketCategoryDto) => ticketCategoriesService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-categories"] }),
  });
}

export function useUpdateTicketCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTicketCategoryDto }) =>
      ticketCategoriesService.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-categories"] }),
  });
}

export function useDeleteTicketCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketCategoriesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-categories"] }),
  });
}

export function useAdminRegistrations(params?: {
  page?: number;
  limit?: number;
  status?: RegistrationStatus;
  ticketCategoryId?: string;
}) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.registrations.admin({ ...params, symposiumId }),
    queryFn: () =>
      registrationsService.listAdmin({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 100,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
  return { ...query, registrations: query.data?.items ?? [], meta: query.data?.meta };
}

export function useWalkInRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: DeskWalkInDto) => registrationsService.walkIn(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["registrations"] }),
  });
}

export function useAdminUpdateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdminUpdateRegistrationDto }) =>
      registrationsService.adminUpdate(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["registrations"] }),
  });
}

export function useExportRegistrations() {
  const symposiumId = useSymposiumId();
  return useMutation({
    mutationFn: (status?: string) =>
      adminService.exportRegistrations({
        symposiumId: symposiumId!,
        ...(status ? { status } : {}),
      }),
  });
}

export function useFinanceSummary() {
  const symposiumId = useSymposiumId();
  return useQuery({
    queryKey: queryKeys.finance.summary(symposiumId ?? undefined),
    queryFn: () => financeService.getSummary(symposiumId ?? undefined),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
}

export function useFinanceTransactions(params?: { page?: number; limit?: number; status?: string; method?: string }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.finance.transactions({ ...params, symposiumId }),
    queryFn: () =>
      financeService.listTransactions({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 50,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
  return { ...query, transactions: query.data?.items ?? [] };
}

export function useFinanceRefunds(params?: { page?: number; limit?: number; status?: string }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.finance.refunds({ ...params, symposiumId }),
    queryFn: () =>
      financeService.listRefunds({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 50,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
  return { ...query, refunds: query.data?.items ?? [] };
}

export function useConfirmManualPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ConfirmManualPaymentDto }) =>
      paymentsService.confirmManual(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useAdminSessions(params?: { day?: number; limit?: number }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.sessions.admin({ ...params, symposiumId }),
    queryFn: () =>
      sessionsService.listAdmin({
        symposiumId: symposiumId!,
        limit: params?.limit ?? 100,
        day: params?.day,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, sessions: query.data?.items ?? [] };
}

export function useAdminTracks() {
  const symposiumId = useSymposiumId();
  return useQuery({
    queryKey: queryKeys.sessions.tracksAdmin(symposiumId ?? ""),
    queryFn: () => sessionsService.listTracksAdmin(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 120_000,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSessionDto) => sessionsService.createAdmin(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSessionDto }) =>
      sessionsService.updateAdmin(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsService.removeAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTrackDto) => sessionsService.createTrack(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tracks"] }),
  });
}

export function useAdminSpeakers(params?: { page?: number; limit?: number }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.speakers.admin(symposiumId ?? "", params),
    queryFn: () => speakersService.list(symposiumId!, { ...params, limit: params?.limit ?? 100 }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, speakers: query.data?.items ?? [] };
}

export function useCreateSpeaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSpeakerDto) => speakersService.createAdmin(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["speakers"] }),
  });
}

export function useUpdateSpeaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSpeakerDto }) =>
      speakersService.updateAdmin(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["speakers"] }),
  });
}

export function useDeleteSpeaker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => speakersService.removeAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["speakers"] }),
  });
}

export function useAdminAnnouncements(params?: { page?: number; limit?: number }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.announcements.admin({ ...params, symposiumId }),
    queryFn: () =>
      announcementsService.listAdmin({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 50,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, announcements: query.data?.items ?? [] };
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAnnouncementDto) => announcementsService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAnnouncementDto }) =>
      announcementsService.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsService.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  const query = useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersService.list({ ...params, limit: params?.limit ?? 50 }),
    enabled: enabled(),
    staleTime: 60_000,
  });
  return { ...query, users: query.data?.items ?? [] };
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AdminCreateUserDto) => usersService.createAdmin(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdminUpdateUserDto }) =>
      usersService.updateAdmin(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => rolesService.list(),
    enabled: enabled(),
    staleTime: 300_000,
  });
}

export function useAuditLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminService.listAuditLogs({ ...params, limit: params?.limit ?? 50 }),
    enabled: enabled(),
    staleTime: 30_000,
  });
}

export function useRecentRegistrations() {
  const symposiumId = useSymposiumId();
  return useQuery({
    queryKey: queryKeys.admin.recentRegistrations(symposiumId ?? ""),
    queryFn: () => adminService.getRecentRegistrations(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
}

export function useAdminExhibitors(params?: { page?: number; limit?: number }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.exhibitors.admin({ ...params, symposiumId }),
    queryFn: () =>
      exhibitorsService.listAdmin({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 50,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, exhibitors: query.data?.items ?? [] };
}

export function useCreateExhibitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExhibitorDto) => exhibitorsService.createAdmin(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exhibitors"] }),
  });
}

export function useUpdateExhibitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExhibitorDto }) =>
      exhibitorsService.updateAdmin(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exhibitors"] }),
  });
}

export function useAdminSubmissions(params?: { page?: number; limit?: number; status?: string }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.submissions.admin({ ...params, symposiumId }),
    queryFn: () =>
      submissionsService.listAdmin({
        ...params,
        symposiumId: symposiumId ?? undefined,
        limit: params?.limit ?? 100,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions"] }),
  });
}

export function useSubmissionReviews(submissionId: string) {
  return useQuery({
    queryKey: ["reviews", submissionId],
    queryFn: () => reviewsService.listForSubmission(submissionId),
    enabled: enabled() && Boolean(submissionId),
  });
}

export function useAdminGroups(params?: { search?: string; page?: number; limit?: number }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.groups.admin({ symposiumId, ...params }),
    queryFn: () =>
      registrationsService.listAdminGroups({
        symposiumId: symposiumId!,
        search: params?.search,
        page: params?.page,
        limit: params?.limit ?? 100,
      }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
  return { ...query, groups: query.data?.items ?? [], meta: query.data?.meta };
}

export function useAdminCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AdminCreateGroupRegistrationDto) => registrationsService.adminCreateGroup(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

export function useAdminUpdateRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdminUpdateRefundStatusDto }) =>
      refundsService.adminUpdateStatus(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "refunds"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

export { registrationStatusLabel } from "@/lib/api/mappers/registration-helpers";
