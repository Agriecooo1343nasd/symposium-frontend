import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { SponsorDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const sponsorsService = {
  listBySymposium(symposiumId: string) {
    return apiClient
      .get<ApiResponse<SponsorDto[]>>(`/symposiums/${symposiumId}/sponsors`)
      .then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string }) {
    return apiClient
      .get<ApiResponse<SponsorDto[]>>("/sponsors/admin/list", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<SponsorDto>>(`/sponsors/admin/${id}`).then(unwrapApi);
  },
  create(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<SponsorDto>>("/sponsors/admin", dto).then(unwrapApi);
  },
  update(id: string, dto: Record<string, unknown>) {
    return apiClient.patch<ApiResponse<SponsorDto>>(`/sponsors/admin/${id}`, dto).then(unwrapApi);
  },
  remove(id: string) {
    return apiClient.delete(`/sponsors/admin/${id}`);
  },
};
