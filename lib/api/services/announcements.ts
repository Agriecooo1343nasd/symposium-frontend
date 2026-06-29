import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { AnnouncementDto, CreateAnnouncementDto, UpdateAnnouncementDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const announcementsService = {
  listPublished(params?: PaginationParams & { symposiumId?: string }) {
    return apiClient
      .get<ApiResponse<AnnouncementDto[]>>("/announcements", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getBySlug(slug: string) {
    return apiClient.get<ApiResponse<AnnouncementDto>>(`/announcements/${slug}`).then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string }) {
    return apiClient
      .get<ApiResponse<AnnouncementDto[]>>("/announcements/admin/list", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<AnnouncementDto>>(`/announcements/admin/${id}`).then(unwrapApi);
  },
  create(dto: CreateAnnouncementDto) {
    return apiClient.post<ApiResponse<AnnouncementDto>>("/announcements/admin", dto).then(unwrapApi);
  },
  update(id: string, dto: UpdateAnnouncementDto) {
    return apiClient.patch<ApiResponse<AnnouncementDto>>(`/announcements/admin/${id}`, dto).then(unwrapApi);
  },
  publish(id: string) {
    return apiClient.post<ApiResponse<AnnouncementDto>>(`/announcements/admin/${id}/publish`).then(unwrapApi);
  },
  remove(id: string) {
    return apiClient.delete(`/announcements/admin/${id}`);
  },
};
