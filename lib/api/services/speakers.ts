import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateSpeakerDto,
  SessionSpeakerDto,
  SpeakerDashboardDto,
  SpeakerDto,
  SponsorshipApplicationDto,
  SponsorshipApplicationStatsDto,
  SponsorshipInvoiceDto,
  SponsorshipTierPricingDto,
  SponsorDto,
  UpdateSpeakerDto,
} from "../dto";
import { type PaginationParams, type PaginatedResult } from "../helpers";
import { sessionsService } from "./sessions";

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
 * GET /speakers?symposiumId=… is broken on the hosted API: PaginationDto validation
 * rejects symposiumId ("property symposiumId should not exist"). Until backend fixes
 * SpeakersListQueryDto, build the directory from programme sessions + GET /speakers/:id.
 */
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
  return listFromProgrammeSessions(symposiumId, params);
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
