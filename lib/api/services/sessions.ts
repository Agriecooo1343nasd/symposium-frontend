import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CreateSessionDto, SessionDto, TrackDto, UpdateSessionDto, CreateTrackDto, UpdateTrackDto } from "../dto";
import { type PaginationParams, fetchPaginatedList, toQueryParams, unwrapPaginated } from "../helpers";

export const sessionsService = {
  listBySymposium(
    symposiumId: string,
    params?: PaginationParams & { trackId?: string; dayIndex?: number; track?: string; day?: number },
  ) {
    const { trackId, dayIndex, track, day, ...pagination } = params ?? {};
    const filters = {
      ...(track ?? trackId ? { track: track ?? trackId } : {}),
      ...(day ?? dayIndex ? { day: day ?? dayIndex } : {}),
    };

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<SessionDto[]>>(`/symposiums/${symposiumId}/sessions`, {
            params: toQueryParams({ ...pg, ...filters }),
          })
          .then(unwrapPaginated),
      { pagination },
    );
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<SessionDto>>(`/sessions/${id}`).then(unwrapApi);
  },
  listAdmin(params: PaginationParams & { symposiumId: string; day?: number; track?: string; type?: string }) {
    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<SessionDto[]>>("/sessions/admin/list", {
            params: toQueryParams({ ...params, ...pg }),
          })
          .then(unwrapPaginated),
      { pagination: params },
    );
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<SessionDto>>(`/sessions/admin/${id}`).then(unwrapApi);
  },
  createAdmin(dto: CreateSessionDto) {
    return apiClient.post<ApiResponse<SessionDto>>("/sessions/admin", dto).then(unwrapApi);
  },
  updateAdmin(id: string, dto: UpdateSessionDto) {
    return apiClient.patch<ApiResponse<SessionDto>>(`/sessions/admin/${id}`, dto).then(unwrapApi);
  },
  removeAdmin(id: string) {
    return apiClient.delete(`/sessions/admin/${id}`);
  },
  listTracks(symposiumId: string) {
    return apiClient
      .get<ApiResponse<TrackDto[]>>(`/symposiums/${symposiumId}/tracks`)
      .then(unwrapApi);
  },
  listTracksAdmin(symposiumId: string) {
    return apiClient
      .get<ApiResponse<TrackDto[]>>("/tracks/admin", { params: { symposiumId } })
      .then(unwrapApi);
  },
  createTrack(dto: CreateTrackDto) {
    return apiClient.post<ApiResponse<TrackDto>>("/tracks/admin", dto).then(unwrapApi);
  },
  updateTrack(id: string, dto: UpdateTrackDto) {
    return apiClient.patch<ApiResponse<TrackDto>>(`/tracks/admin/${id}`, dto).then(unwrapApi);
  },
  removeTrack(id: string) {
    return apiClient.delete(`/tracks/admin/${id}`);
  },
};
