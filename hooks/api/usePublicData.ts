"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSymposium } from "@/hooks/api/useSymposium";
import { queryKeys } from "@/lib/api/query-keys";
import {
  announcementsService,
  cmsService,
  sessionsService,
  speakersService,
  sponsorsService,
  ticketCategoriesService,
} from "@/lib/api/services";
import { mapAnnouncements } from "@/lib/api/mappers/announcement";
import { mapSessionDto, mapSessions } from "@/lib/api/mappers/session";
import { mapSpeakers } from "@/lib/api/mappers/speaker";
import { mapTicketCategories } from "@/lib/api/mappers/ticketCategory";
import type { CreateContactMessageDto, SessionDto } from "@/lib/api/dto";

const LONG_STALE = 5 * 60_000;

export function usePublicSessions() {
  const { symposiumId } = useSymposium();
  const query = useQuery({
    queryKey: queryKeys.sessions.bySymposium(symposiumId ?? "none", { public: true }),
    queryFn: () => sessionsService.listBySymposium(symposiumId as string, { limit: 100 }),
    enabled: Boolean(symposiumId),
    staleTime: LONG_STALE,
  });
  const raw: SessionDto[] = query.data?.items ?? [];
  return {
    ...query,
    raw,
    sessions: mapSessions(raw),
  };
}

export function usePublicSession(id: string) {
  const query = useQuery({
    queryKey: queryKeys.sessions.detail(id),
    queryFn: () => sessionsService.getById(id),
    enabled: Boolean(id),
    staleTime: LONG_STALE,
  });
  return {
    ...query,
    raw: query.data ?? null,
    session: query.data ? mapSessionDto(query.data) : null,
  };
}

export function usePublicTracks() {
  const { symposiumId } = useSymposium();
  return useQuery({
    queryKey: queryKeys.sessions.tracks(symposiumId ?? "none"),
    queryFn: () => sessionsService.listTracks(symposiumId as string),
    enabled: Boolean(symposiumId),
    staleTime: LONG_STALE,
  });
}

export function usePublicSpeakers() {
  const { symposiumId } = useSymposium();
  const query = useQuery({
    queryKey: queryKeys.speakers.bySymposium(symposiumId ?? "none", { public: true }),
    queryFn: () => speakersService.list(symposiumId as string, { limit: 100 }),
    enabled: Boolean(symposiumId),
    staleTime: LONG_STALE,
  });
  return {
    ...query,
    speakers: mapSpeakers(query.data?.items ?? []),
  };
}

export function usePublicSponsors() {
  const { symposiumId } = useSymposium();
  return useQuery({
    queryKey: queryKeys.sponsors.bySymposium(symposiumId ?? "none"),
    queryFn: () => sponsorsService.listBySymposium(symposiumId as string),
    enabled: Boolean(symposiumId),
    staleTime: LONG_STALE,
  });
}

export function usePublicTicketCategories() {
  const { symposiumId } = useSymposium();
  const query = useQuery({
    queryKey: queryKeys.ticketCategories.public(symposiumId ?? "none"),
    queryFn: () => ticketCategoriesService.listPublic(symposiumId as string),
    enabled: Boolean(symposiumId),
    staleTime: LONG_STALE,
  });
  return {
    ...query,
    raw: query.data ?? [],
    ticketCategories: mapTicketCategories(query.data ?? []),
  };
}

export function usePublicAnnouncements() {
  const { symposiumId } = useSymposium();
  const query = useQuery({
    queryKey: queryKeys.announcements.public({ symposiumId }),
    queryFn: () => announcementsService.listPublished({ symposiumId: symposiumId ?? undefined, limit: 50 }),
    enabled: Boolean(symposiumId),
    staleTime: LONG_STALE,
  });
  return {
    ...query,
    news: mapAnnouncements(query.data?.items ?? []),
  };
}

export function usePublicFaqs() {
  const { symposiumId } = useSymposium();
  return useQuery({
    queryKey: queryKeys.cms.faqs(symposiumId ?? undefined),
    queryFn: () => cmsService.getFaqs(symposiumId ?? undefined),
    enabled: Boolean(symposiumId),
    staleTime: LONG_STALE,
  });
}

export function useSubmitContact() {
  const { symposiumId } = useSymposium();
  return useMutation({
    mutationFn: (dto: Omit<CreateContactMessageDto, "symposiumId">) =>
      cmsService.submitContact({ ...dto, symposiumId: symposiumId ?? undefined }),
  });
}
