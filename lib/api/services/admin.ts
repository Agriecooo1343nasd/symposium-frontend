import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const adminService = {
  getRecentRegistrations(symposiumId: string) {
    return apiClient
      .get<ApiResponse<Record<string, unknown>[]>>("/admin/recent-registrations", {
        params: { symposiumId },
      })
      .then(unwrapApi);
  },
  getRecentActivities() {
    return apiClient.get<ApiResponse<Record<string, unknown>[]>>("/admin/recent-activities").then(unwrapApi);
  },
  listAuditLogs(params?: PaginationParams) {
    return apiClient
      .get<ApiResponse<Record<string, unknown>[]>>("/admin/audit-logs", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getDeskAudit(symposiumId: string) {
    return apiClient
      .get<ApiResponse<Record<string, unknown>>>("/admin/desk-audit", { params: { symposiumId } })
      .then(unwrapApi);
  },
  broadcast(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<Record<string, unknown>>>("/admin/broadcast", dto).then(unwrapApi);
  },
  exportRegistrations(params: Record<string, string>) {
    return apiClient.get("/admin/registrations/export", { params, responseType: "blob" });
  },
};
