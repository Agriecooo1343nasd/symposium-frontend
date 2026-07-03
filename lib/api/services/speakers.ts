import { isAxiosError } from "axios";
import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CreateSpeakerDto, SessionSpeakerDto, SpeakerDashboardDto, SpeakerDto, UpdateSpeakerDto } from "../dto";
import { type PaginationParams, type PaginatedResult, unwrapPaginated } from "../helpers";
import { sessionsService } from "./sessions";

function isSpeakersListError(err: unknown): boolean {
  return isAxiosError(err) && (err.response?.status === 400 || err.response?.status === 422);
}

function toSpeakerFromSession(symposiumId: string, sp: SessionSpeakerDto): SpeakerDto {
  return {
    id: sp.id,
    symposiumId,
    name: sp.name,
    title: sp.title ?? null,
    organization: sp.organization ?? null,
    photoUrl: sp.photoUrl ?? null,
  };
}

async function fetchSpeakerById(id: string): Promise<SpeakerDto | null> {
  try {
    return await apiClient.get<ApiResponse<SpeakerDto>>(`/speakers/${id}`).then(unwrapApi);
  } catch {
    return null;
  }
}

function mergeSpeakers(primary: SpeakerDto[], extra: SpeakerDto[]): SpeakerDto[] {
  const map = new Map<string, SpeakerDto>();
  for (const s of [...primary, ...extra]) {
    map.set(s.id, s);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * GET /speakers rejects symposiumId when combined with page/limit (PaginationDto conflict).
 * Request symposiumId alone — backend defaults page/limit internally.
 */
async function fetchSpeakersFromApi(symposiumId: string): Promise<SpeakerDto[] | null> {
  try {
    const res = await apiClient.get<ApiResponse<SpeakerDto[]>>("/speakers", {
      params: { symposiumId },
    });
    return unwrapPaginated(res).items;
  } catch (err) {
    if (isSpeakersListError(err)) return null;
    throw err;
  }
}

async function listFromProgrammeSessions(
  symposiumId: string,
  params?: PaginationParams,
): Promise<PaginatedResult<SpeakerDto>> {
  const limit = params?.limit ?? 100;
  const res = await sessionsService.listBySymposium(symposiumId, { limit: 100 });
  const sessionSpeakers = new Map<string, SessionSpeakerDto>();
  for (const session of res.items) {
    for (const sp of session.speakers ?? []) {
      if (!sessionSpeakers.has(sp.id)) sessionSpeakers.set(sp.id, sp);
    }
  }

  const items = await Promise.all(
    [...sessionSpeakers.values()].map(async (sp) => {
      const full = await fetchSpeakerById(sp.id);
      return full ?? toSpeakerFromSession(symposiumId, sp);
    }),
  );

  items.sort((a, b) => a.name.localeCompare(b.name));
  const sliced = items.slice(0, limit);
  return { items: sliced, meta: { total: items.length, page: 1, limit: sliced.length } };
}

async function listSpeakersMerged(symposiumId: string, params?: PaginationParams): Promise<PaginatedResult<SpeakerDto>> {
  const limit = params?.limit ?? 100;
  const fromApi = await fetchSpeakersFromApi(symposiumId);
  const fromSessions = await listFromProgrammeSessions(symposiumId, { limit: 100 });

  if (fromApi !== null) {
    const merged = mergeSpeakers(fromApi, fromSessions.items).slice(0, limit);
    return {
      items: merged,
      meta: { total: merged.length, page: 1, limit: merged.length },
    };
  }

  return {
    items: fromSessions.items.slice(0, limit),
    meta: fromSessions.meta,
  };
}

export const speakersService = {
  listPublic(symposiumId: string, params?: PaginationParams) {
    return listSpeakersMerged(symposiumId, params);
  },

  list(symposiumId: string, params?: PaginationParams) {
    return listSpeakersMerged(symposiumId, params);
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<SpeakerDto>>(`/speakers/${id}`).then(unwrapApi);
  },
  getMyDashboard() {
    return apiClient.get<ApiResponse<SpeakerDashboardDto>>("/speakers/me/dashboard").then(unwrapApi);
  },
  createAdmin(dto: CreateSpeakerDto) {
    return apiClient.post<ApiResponse<SpeakerDto>>("/speakers/admin", dto).then(unwrapApi);
  },
  updateAdmin(id: string, dto: UpdateSpeakerDto) {
    return apiClient.patch<ApiResponse<SpeakerDto>>(`/speakers/admin/${id}`, dto).then(unwrapApi);
  },
  removeAdmin(id: string) {
    return apiClient.delete(`/speakers/admin/${id}`);
  },
};
