import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CreateSpeakerDto, SpeakerDashboardDto, SpeakerDto, UpdateSpeakerDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const speakersService = {
  list(symposiumId: string, params?: PaginationParams) {
    return apiClient
      .get<ApiResponse<SpeakerDto[]>>("/speakers", {
        params: toQueryParams({ symposiumId, ...params }),
      })
      .then(unwrapPaginated);
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
