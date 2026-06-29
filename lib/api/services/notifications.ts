import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { NotificationDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const notificationsService = {
  listMine(params?: PaginationParams) {
    return apiClient
      .get<ApiResponse<NotificationDto[]>>("/notifications/me", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  markRead(id: string) {
    return apiClient.patch<ApiResponse<NotificationDto>>(`/notifications/${id}/read`).then(unwrapApi);
  },
  markAllRead() {
    return apiClient.patch<ApiResponse<{ count?: number }>>("/notifications/me/read-all").then(unwrapApi);
  },
};
