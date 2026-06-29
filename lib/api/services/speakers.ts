import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { SpeakerDto } from "../dto";
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
    return apiClient.get<ApiResponse<Record<string, unknown>>>("/speakers/me/dashboard").then(unwrapApi);
  },
};
