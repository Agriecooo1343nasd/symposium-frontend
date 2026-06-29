import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { SessionDto, TrackDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const sessionsService = {
  listBySymposium(symposiumId: string, params?: PaginationParams & { trackId?: string; dayIndex?: number }) {
    return apiClient
      .get<ApiResponse<SessionDto[]>>(`/symposiums/${symposiumId}/sessions`, {
        params: toQueryParams(params),
      })
      .then(unwrapPaginated);
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<SessionDto>>(`/sessions/${id}`).then(unwrapApi);
  },
  listAdmin(params: PaginationParams & { symposiumId: string }) {
    return apiClient
      .get<ApiResponse<SessionDto[]>>("/sessions/admin/list", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  listTracks(symposiumId: string) {
    return apiClient
      .get<ApiResponse<TrackDto[]>>(`/symposiums/${symposiumId}/tracks`)
      .then(unwrapApi);
  },
};
