import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  AdminUpdateRegistrationDto,
  CreateGroupRegistrationDto,
  CreateRegistrationDto,
  DeskWalkInDto,
  FaceVerificationDto,
  RegistrationDto,
  RegistrationReceiptDto,
  RegistrationStatus,
  SetFacePhotoDto,
  UpdateRegistrationCategoryDto,
} from "../dto";
import { type PaginationParams, fetchPaginatedList, toPaginationQuery, unwrapPaginated } from "../helpers";

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
    return apiClient.get<ApiResponse<RegistrationReceiptDto>>(`/registrations/me/${id}/receipt`).then(unwrapApi);
  },
  setFacePhoto(id: string, dto: SetFacePhotoDto) {
    return apiClient.post<ApiResponse<RegistrationDto>>(`/registrations/${id}/face-photo`, dto).then(unwrapApi);
  },
  updateFaceVerification(id: string, dto: FaceVerificationDto) {
    return apiClient
      .patch<ApiResponse<RegistrationDto>>(`/registrations/${id}/face-verification`, dto)
      .then(unwrapApi);
  },
  reprintBadge(id: string) {
    return apiClient
      .post<ApiResponse<{ message?: string }>>(`/registrations/${id}/badge/reprint`)
      .then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string; ticketCategoryId?: string; status?: RegistrationStatus }) {
    const { symposiumId, ticketCategoryId, status, ...pagination } = params ?? {};
    const match =
      symposiumId || ticketCategoryId || status
        ? (item: RegistrationDto) =>
            (!symposiumId || item.symposiumId === symposiumId) &&
            (!ticketCategoryId || item.ticketCategoryId === ticketCategoryId) &&
            (!status || item.status === status)
        : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<RegistrationDto[]>>("/registrations", { params: toPaginationQuery(pg) })
          .then(unwrapPaginated),
      { pagination, match },
    );
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<RegistrationDto>>(`/registrations/${id}`).then(unwrapApi);
  },
  adminUpdate(id: string, dto: AdminUpdateRegistrationDto) {
    return apiClient.patch<ApiResponse<RegistrationDto>>(`/registrations/${id}`, dto).then(unwrapApi);
  },
  approve(id: string) {
    return apiClient.post<ApiResponse<RegistrationDto>>(`/registrations/${id}/approve`).then(unwrapApi);
  },
  reject(id: string) {
    return apiClient.post<ApiResponse<RegistrationDto>>(`/registrations/${id}/reject`).then(unwrapApi);
  },
  walkIn(dto: DeskWalkInDto) {
    return apiClient.post<ApiResponse<RegistrationDto>>("/registrations/desk/walk-in", dto).then(unwrapApi);
  },
};
