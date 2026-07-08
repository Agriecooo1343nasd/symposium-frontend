"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
  certificatesService,
  notificationsService,
  refundsService,
  schedulesService,
  submissionsService,
  usersService,
} from "@/lib/api/services";
import { mapNotifications } from "@/lib/api/mappers/notification";
import { mapSessions } from "@/lib/api/mappers/session";
import { mapUserDto } from "@/lib/api/mappers/user";
import { getAccessToken } from "@/lib/api/client";
import { buildSessionFromUser } from "@/lib/auth/session";
import { writeSession } from "@/lib/auth";
import { rolesFromAccessToken } from "@/lib/auth/roles";
import { permissionsFromAccessToken } from "@/lib/auth/roles";
import type {
  CreateRefundRequestDto,
  CreateSubmissionDto,
  UpdateProfileDto,
} from "@/lib/api/dto";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useMyNotifications(params?: { page?: number; limit?: number }) {
  const query = useQuery({
    queryKey: queryKeys.notifications.mine(params),
    queryFn: () => notificationsService.listMine({ ...params, limit: params?.limit ?? 20 }),
    enabled: enabled(),
    staleTime: 60_000,
  });
  return {
    ...query,
    notifications: mapNotifications(query.data?.items ?? []),
    unreadCount: (query.data?.items ?? []).filter((n) => !n.readAt).length,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMySchedule(params?: { day?: number }) {
  const query = useQuery({
    queryKey: queryKeys.schedules.mine(params),
    queryFn: () => schedulesService.listMine(params),
    enabled: enabled(),
    staleTime: 60_000,
  });
  const sessions = mapSessions((query.data ?? []).map((e) => e.session));
  const sessionIds = new Set((query.data ?? []).map((e) => e.sessionId));
  return { ...query, entries: query.data ?? [], sessions, sessionIds };
}

export function useAddToSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => schedulesService.addSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useRemoveFromSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => schedulesService.removeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useMyRefunds() {
  return useQuery({
    queryKey: queryKeys.refunds.mine,
    queryFn: () => refundsService.listMine(),
    enabled: enabled(),
    staleTime: 60_000,
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRefundRequestDto) => refundsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.mine });
    },
  });
}

export function useMySubmissions() {
  return useQuery({
    queryKey: queryKeys.submissions.mine,
    queryFn: () => submissionsService.listMine(),
    enabled: enabled(),
    staleTime: 60_000,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubmissionDto) => submissionsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.mine });
    },
  });
}

export function useMyCertificates() {
  return useQuery({
    queryKey: queryKeys.certificates.mine,
    queryFn: () => certificatesService.listMine(),
    enabled: enabled(),
    staleTime: 60_000,
    retry: false,
  });
}

export function useGenerateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationId: string) => certificatesService.generate(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates.mine });
    },
  });
}

export function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => usersService.updateMe(dto),
    onSuccess: (user) => {
      const token = getAccessToken();
      const permissions = token ? permissionsFromAccessToken(token) : [];
      dispatch(setUser(mapUserDto(user, permissions)));
      queryClient.setQueryData(queryKeys.users.me, user);
      const roles = token ? rolesFromAccessToken(token) : user.roles ?? [];
      writeSession(buildSessionFromUser(user, roles));
    },
  });
}
