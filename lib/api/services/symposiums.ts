import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { SymposiumDto } from "../dto";
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
};
