"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
  analyticsService,
  cmsService,
  engagementService,
  networkingService,
  resourcesService,
  surveysService,
  symposiumsService,
  waitlistService,
} from "@/lib/api/services";
import { getAccessToken } from "@/lib/api/client";
import type {
  AdminBroadcastDto,
  AnalyticsPeriod,
  CreateConnectionRequestDto,
  CreatePollDto,
  CreateSessionQuestionDto,
  CreateSessionRatingDto,
  CreateSurveyDto,
  SubmitSurveyResponseDto,
  UpdateSymposiumSettingsDto,
  UpsertCommitteeMemberDto,
  UpsertFaqDto,
  VotePollDto,
} from "@/lib/api/dto";
import { adminService } from "@/lib/api/services";
import { useSymposiumId } from "./useSymposium";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useAnalyticsDashboard() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.analytics.dashboard(symposiumId ?? ""),
    queryFn: () => analyticsService.getDashboard(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, dashboard: query.data ?? null };
}

export function useRegistrationsTrend(period: AnalyticsPeriod = "day") {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.analytics.registrationsTrend(symposiumId ?? "", period),
    queryFn: () => analyticsService.getRegistrationsTrend(symposiumId!, period),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, points: query.data ?? [] };
}

export function useTicketDistribution() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.analytics.ticketDistribution(symposiumId ?? ""),
    queryFn: () => analyticsService.getTicketDistribution(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, items: query.data ?? [] };
}

export function useRevenueByPeriod(period: AnalyticsPeriod = "month") {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.analytics.revenueByPeriod(symposiumId ?? "", period),
    queryFn: () => analyticsService.getRevenueByPeriod(symposiumId!, period),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, items: query.data ?? [] };
}

export function useAttendanceHeatmap() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.analytics.attendanceHeatmap(symposiumId ?? ""),
    queryFn: () => analyticsService.getAttendanceHeatmap(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, cells: query.data ?? [] };
}

export function useActiveSurveys() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.surveys.active(symposiumId ?? undefined),
    queryFn: () => surveysService.listActive(symposiumId ?? undefined),
    enabled: enabled(),
    staleTime: 60_000,
    retry: false,
  });
  return { ...query, surveys: query.data ?? [] };
}

export function useAdminSurveys() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.surveys.admin(symposiumId ?? undefined),
    queryFn: () => surveysService.listAdmin(symposiumId ?? undefined),
    enabled: enabled(),
    staleTime: 60_000,
  });
  return { ...query, surveys: query.data ?? [] };
}

export function useSurveyResults(id: string | null) {
  return useQuery({
    queryKey: queryKeys.surveys.results(id ?? ""),
    queryFn: () => surveysService.results(id!),
    enabled: enabled() && Boolean(id),
    staleTime: 60_000,
  });
}

export function useSubmitSurveyResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SubmitSurveyResponseDto }) =>
      surveysService.submitResponse(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSurveyDto) => surveysService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => surveysService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useNetworkingDirectory(params?: {
  page?: number;
  limit?: number;
  country?: string;
  organization?: string;
  interest?: string;
}) {
  const query = useQuery({
    queryKey: queryKeys.networking.directory(params),
    queryFn: () => networkingService.directory(params),
    enabled: enabled(),
    staleTime: 60_000,
    retry: false,
  });
  return { ...query, users: query.data ?? [] };
}

export function useRequestConnection() {
  return useMutation({
    mutationFn: (dto: CreateConnectionRequestDto) => networkingService.requestConnection(dto),
  });
}

export function useConnectionMessages(connectionId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.networking.messages(connectionId ?? ""),
    queryFn: () => networkingService.listMessages(connectionId!),
    enabled: enabled() && Boolean(connectionId),
    staleTime: 15_000,
  });
  return { ...query, messages: query.data ?? [] };
}

export function useSessionQuestions(sessionId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.engagement.questions(sessionId ?? ""),
    queryFn: () => engagementService.listQuestions(sessionId!),
    enabled: enabled() && Boolean(sessionId),
    staleTime: 15_000,
  });
  return { ...query, questions: query.data ?? [] };
}

export function useAskQuestion(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSessionQuestionDto) => engagementService.askQuestion(sessionId, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.engagement.questions(sessionId) }),
  });
}

export function useSessionPolls(sessionId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.engagement.polls(sessionId ?? ""),
    queryFn: () => engagementService.listPolls(sessionId!),
    enabled: enabled() && Boolean(sessionId),
    staleTime: 15_000,
  });
  return { ...query, polls: query.data ?? [] };
}

export function useCreatePoll(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePollDto) => engagementService.createPoll(sessionId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.engagement.polls(sessionId) }),
  });
}

export function useVotePoll(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pollId, dto }: { pollId: string; dto: VotePollDto }) =>
      engagementService.votePoll(pollId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.engagement.polls(sessionId) }),
  });
}

export function useRateSession(sessionId: string) {
  return useMutation({
    mutationFn: (dto: CreateSessionRatingDto) => engagementService.rateSession(sessionId, dto),
  });
}

export function usePublicResources() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.resources.public(symposiumId ?? ""),
    queryFn: () => resourcesService.listPublic(symposiumId!),
    enabled: Boolean(symposiumId),
    staleTime: 5 * 60_000,
  });
  return { ...query, resources: query.data ?? [] };
}

export function useResourceLibrary() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.resources.library(symposiumId ?? ""),
    queryFn: () => resourcesService.listLibrary(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
    retry: false,
  });
  return { ...query, resources: query.data ?? [] };
}

export function useWaitlistAdmin(params?: { symposiumId?: string; ticketCategoryId?: string }) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.waitlist.admin({ ...params, symposiumId }),
    queryFn: () => waitlistService.listAdmin({ symposiumId: symposiumId ?? undefined, ...params }),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, entries: query.data ?? [] };
}

export function usePromoteWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => waitlistService.promote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waitlist"] }),
  });
}

export function useSymposiumSettings() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.symposiumSettings.detail(symposiumId ?? ""),
    queryFn: () => symposiumsService.getSettings(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, settings: query.data ?? null };
}

export function useUpdateSymposiumSettings() {
  const symposiumId = useSymposiumId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSymposiumSettingsDto) => symposiumsService.updateSettings(symposiumId!, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.symposiumSettings.detail(symposiumId ?? "") }),
  });
}

export function useCommitteeMembers() {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.cmsAdmin.committee(symposiumId ?? ""),
    queryFn: () => cmsService.listCommittee(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 60_000,
  });
  return { ...query, members: query.data ?? [] };
}

export function useUpsertCommitteeMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id?: string; dto: UpsertCommitteeMemberDto }) =>
      id ? cmsService.updateCommittee(id, dto) : cmsService.createCommittee(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms", "admin", "committee"] }),
  });
}

export function useDeleteCommitteeMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.deleteCommittee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms", "admin", "committee"] }),
  });
}

export function useContactMessages(params?: { page?: number; limit?: number }) {
  const query = useQuery({
    queryKey: queryKeys.cmsAdmin.contactMessages(params),
    queryFn: () => cmsService.listContactMessages(params),
    enabled: enabled(),
    staleTime: 60_000,
  });
  return { ...query, messages: query.data ?? [] };
}

export function useUpsertFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id?: string; dto: UpsertFaqDto }) =>
      id ? cmsService.updateFaq(id, dto) : cmsService.createFaq(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms"] }),
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.deleteFaq(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms"] }),
  });
}

export function useAdminBroadcast() {
  return useMutation({
    mutationFn: (dto: AdminBroadcastDto) => adminService.broadcast(dto),
  });
}
