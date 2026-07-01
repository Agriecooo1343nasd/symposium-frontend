import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { WaitlistEntryDto } from "../dto";

export const waitlistService = {
  listAdmin(params?: { symposiumId?: string; ticketCategoryId?: string }) {
    return apiClient
      .get<ApiResponse<WaitlistEntryDto[]>>("/waitlist/admin", { params })
      .then(unwrapApi);
  },
  promote(id: string) {
    return apiClient.post<ApiResponse<WaitlistEntryDto>>(`/waitlist/admin/${id}/promote`).then(unwrapApi);
  },
};
