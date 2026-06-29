import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { UpdateProfileDto, UserDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const usersService = {
  getMe() {
    return apiClient.get<ApiResponse<UserDto>>("/users/me").then(unwrapApi);
  },
  updateMe(dto: UpdateProfileDto) {
    return apiClient.patch<ApiResponse<UserDto>>("/users/me", dto).then(unwrapApi);
  },
  list(params?: PaginationParams) {
    return apiClient
      .get<ApiResponse<UserDto[]>>("/users", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<UserDto>>(`/users/${id}`).then(unwrapApi);
  },
  createAdmin(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<UserDto>>("/users/admin", dto).then(unwrapApi);
  },
  updateAdmin(id: string, dto: Record<string, unknown>) {
    return apiClient.patch<ApiResponse<UserDto>>(`/users/${id}`, dto).then(unwrapApi);
  },
};
