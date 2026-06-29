import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateExhibitorDto,
  ExhibitorAdminDto,
  ExhibitorLeadDto,
  ExhibitorProfileDto,
  UpdateExhibitorDto,
} from "../dto";
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
      .get<ApiResponse<ExhibitorAdminDto[]>>("/exhibitors/admin/list", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<ExhibitorAdminDto>>(`/exhibitors/admin/${id}`).then(unwrapApi);
  },
  createAdmin(dto: CreateExhibitorDto) {
    return apiClient.post<ApiResponse<ExhibitorAdminDto>>("/exhibitors/admin", dto).then(unwrapApi);
  },
  updateAdmin(id: string, dto: UpdateExhibitorDto) {
    return apiClient.patch<ApiResponse<ExhibitorAdminDto>>(`/exhibitors/admin/${id}`, dto).then(unwrapApi);
  },
  removeAdmin(id: string) {
    return apiClient.delete(`/exhibitors/admin/${id}`);
  },
};
