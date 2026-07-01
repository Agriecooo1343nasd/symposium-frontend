import { isAxiosError } from "axios";
import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CreateSpeakerDto, SessionSpeakerDto, SpeakerDashboardDto, SpeakerDto, UpdateSpeakerDto } from "../dto";
import { type PaginationParams, type PaginatedResult, fetchPaginatedList, toQueryParams, unwrapPaginated } from "../helpers";
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

export const speakersService = {
  /** Public speakers page — avoids broken GET /speakers list query validation on the API. */
  listPublic(symposiumId: string, params?: PaginationParams) {
    return listFromProgrammeSessions(symposiumId, params);
  },

  list(symposiumId: string, params?: PaginationParams) {
    let useProgrammeFallback = false;

    return fetchPaginatedList(
      async (pg) => {
        if (!useProgrammeFallback) {
          try {
            return await apiClient
              .get<ApiResponse<SpeakerDto[]>>("/speakers", {
                params: toQueryParams({ symposiumId, ...pg }),
              })
              .then(unwrapPaginated);
          } catch (err) {
            if (!isSpeakersListError(err)) throw err;
            useProgrammeFallback = true;
          }
        }
        return listFromProgrammeSessions(symposiumId, { ...params, ...pg });
      },
      { pagination: params },
    );
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
