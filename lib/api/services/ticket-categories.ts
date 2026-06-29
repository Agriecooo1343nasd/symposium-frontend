import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateTicketCategoryDto,
  TicketCategoryDto,
  UpdateTicketCategoryDto,
} from "../dto";

export const ticketCategoriesService = {
  listPublic(symposiumId: string) {
    return apiClient
      .get<ApiResponse<TicketCategoryDto[]>>("/ticket-categories", {
        params: { symposiumId },
      })
      .then(unwrapApi);
  },
  listAdmin(symposiumId: string) {
    return apiClient
      .get<ApiResponse<TicketCategoryDto[]>>("/ticket-categories/admin", {
        params: { symposiumId },
      })
      .then(unwrapApi);
  },
  create(dto: CreateTicketCategoryDto) {
    return apiClient.post<ApiResponse<TicketCategoryDto>>("/ticket-categories/admin", dto).then(unwrapApi);
  },
  update(id: string, dto: UpdateTicketCategoryDto) {
    return apiClient
      .patch<ApiResponse<TicketCategoryDto>>(`/ticket-categories/admin/${id}`, dto)
      .then(unwrapApi);
  },
  remove(id: string) {
    return apiClient.delete(`/ticket-categories/admin/${id}`);
  },
};
