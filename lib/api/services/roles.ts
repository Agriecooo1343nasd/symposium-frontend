import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { AssignRoleDto, RoleDto } from "../dto";

export const rolesService = {
  list() {
    return apiClient.get<ApiResponse<RoleDto[]>>("/roles").then(unwrapApi);
  },
  listPermissions() {
    return apiClient.get<ApiResponse<Array<{ id: string; key: string; description?: string }>>>("/permissions").then(unwrapApi);
  },
  assignRole(userId: string, dto: AssignRoleDto) {
    return apiClient.post<ApiResponse<unknown>>(`/users/${userId}/roles`, dto).then(unwrapApi);
  },
  removeRole(userId: string, roleId: string, symposiumId?: string) {
    return apiClient.delete(`/users/${userId}/roles/${roleId}`, {
      params: symposiumId ? { symposiumId } : {},
    });
  },
};
