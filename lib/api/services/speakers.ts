import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateSpeakerDto,
  OnboardSpeakerDto,
  SpeakerDashboardDto,
  SpeakerDto,
  UpdateSpeakerDto,
} from "../dto";
import { type PaginationParams, fetchPaginatedList, toQueryParams, unwrapPaginated } from "../helpers";

/**
 * GET /speakers?symposiumId=… is served by RequiredSymposiumPaginationDto on the
 * backend, so the directory is fetched directly (no programme-session workaround).
 */
function listSpeakers(symposiumId: string, params?: PaginationParams) {
  return fetchPaginatedList(
    (pg) =>
      apiClient
        .get<ApiResponse<SpeakerDto[]>>("/speakers", {
          params: toQueryParams({ ...pg, symposiumId }),
        })
        .then(unwrapPaginated),
    { pagination: params },
  );
}

export const speakersService = {
  listPublic(symposiumId: string, params?: PaginationParams) {
    return listSpeakers(symposiumId, params);
  },

  list(symposiumId: string, params?: PaginationParams) {
    return listSpeakers(symposiumId, params);
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
  onboardAdmin(dto: OnboardSpeakerDto) {
    return apiClient.post<ApiResponse<SpeakerDto>>("/speakers/admin/onboard", dto).then(unwrapApi);
  },
  updateAdmin(id: string, dto: UpdateSpeakerDto) {
    return apiClient.patch<ApiResponse<SpeakerDto>>(`/speakers/admin/${id}`, dto).then(unwrapApi);
  },
  removeAdmin(id: string) {
    return apiClient.delete(`/speakers/admin/${id}`);
  },
};
