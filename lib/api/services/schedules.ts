import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { UserScheduleEntryDto } from "../dto";

export const schedulesService = {
  listMine(params?: { day?: number }) {
    return apiClient
      .get<ApiResponse<UserScheduleEntryDto[]>>("/schedules/me", { params })
      .then(unwrapApi);
  },
  addSession(sessionId: string) {
    return apiClient
      .post<ApiResponse<UserScheduleEntryDto>>(`/schedules/sessions/${sessionId}`)
      .then(unwrapApi);
  },
  removeSession(sessionId: string) {
    return apiClient.delete(`/schedules/sessions/${sessionId}`);
  },
};
