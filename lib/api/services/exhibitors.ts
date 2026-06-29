import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { ExhibitorLeadDto, ExhibitorProfileDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const exhibitorsService = {
  getMyProfile() {
    return apiClient.get<ApiResponse<ExhibitorProfileDto>>("/exhibitors/me").then(unwrapApi);
  },
  updateMyProfile(dto: Record<string, unknown>) {
    return apiClient.patch<ApiResponse<ExhibitorProfileDto>>("/exhibitors/me", dto).then(unwrapApi);
  },
  listMyMaterials() {
    return apiClient.get<ApiResponse<Record<string, unknown>[]>>("/exhibitors/me/materials").then(unwrapApi);
  },
  scanLead(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<ExhibitorLeadDto>>("/exhibitors/leads/scan", dto).then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string }) {
    return apiClient
      .get<ApiResponse<Record<string, unknown>[]>>("/exhibitors/admin/list", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<Record<string, unknown>>>(`/exhibitors/admin/${id}`).then(unwrapApi);
  },
};
