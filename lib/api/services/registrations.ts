import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateGroupRegistrationDto,
  CreateRegistrationDto,
  RegistrationDto,
  RegistrationStatus,
  UpdateRegistrationCategoryDto,
} from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const registrationsService = {
  create(dto: CreateRegistrationDto) {
    return apiClient.post<ApiResponse<RegistrationDto>>("/registrations", dto).then(unwrapApi);
  },
  updateCategory(id: string, dto: UpdateRegistrationCategoryDto) {
    return apiClient
      .patch<ApiResponse<RegistrationDto>>(`/registrations/${id}/category`, dto)
      .then(unwrapApi);
  },
  createGroup(dto: CreateGroupRegistrationDto) {
    return apiClient.post<ApiResponse<RegistrationDto[]>>("/registrations/group", dto).then(unwrapApi);
  },
  joinWaitlist(id: string) {
    return apiClient.post<ApiResponse<RegistrationDto>>(`/registrations/${id}/waitlist`).then(unwrapApi);
  },
  listMine() {
    return apiClient.get<ApiResponse<RegistrationDto[]>>("/registrations/me").then(unwrapApi);
  },
  getReceipt(id: string) {
    return apiClient.get<ApiResponse<Record<string, unknown>>>(`/registrations/me/${id}/receipt`).then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string; ticketCategoryId?: string; status?: RegistrationStatus }) {
    return apiClient
      .get<ApiResponse<RegistrationDto[]>>("/registrations", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<RegistrationDto>>(`/registrations/${id}`).then(unwrapApi);
  },
  approve(id: string) {
    return apiClient.post<ApiResponse<RegistrationDto>>(`/registrations/${id}/approve`).then(unwrapApi);
  },
  reject(id: string) {
    return apiClient.post<ApiResponse<RegistrationDto>>(`/registrations/${id}/reject`).then(unwrapApi);
  },
  walkIn(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<RegistrationDto>>("/registrations/desk/walk-in", dto).then(unwrapApi);
  },
};
