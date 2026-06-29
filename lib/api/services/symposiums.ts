import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  SymposiumDto,
  SymposiumSettingsDto,
  UpdateSymposiumSettingsDto,
} from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const symposiumsService = {
  listPublished(params?: PaginationParams) {
    return apiClient
      .get<ApiResponse<SymposiumDto[]>>("/symposiums", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getBySlug(slug: string) {
    return apiClient.get<ApiResponse<SymposiumDto>>(`/symposiums/${slug}`).then(unwrapApi);
  },
  listAdmin(params?: PaginationParams) {
    return apiClient
      .get<ApiResponse<SymposiumDto[]>>("/symposiums/admin/list", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<SymposiumDto>>(`/symposiums/admin/${id}`).then(unwrapApi);
  },
  create(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<SymposiumDto>>("/symposiums/admin", dto).then(unwrapApi);
  },
  update(id: string, dto: Record<string, unknown>) {
    return apiClient.patch<ApiResponse<SymposiumDto>>(`/symposiums/admin/${id}`, dto).then(unwrapApi);
  },
  remove(id: string) {
    return apiClient.delete(`/symposiums/admin/${id}`);
  },
  getSettings(id: string) {
    return apiClient
      .get<ApiResponse<SymposiumSettingsDto>>(`/symposiums/admin/${id}/settings`)
      .then(unwrapApi);
  },
  updateSettings(id: string, dto: UpdateSymposiumSettingsDto) {
    return apiClient
      .patch<ApiResponse<SymposiumSettingsDto>>(`/symposiums/admin/${id}/settings`, dto)
      .then(unwrapApi);
  },
};
