import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  AnnouncementDto,
  CreateAnnouncementDto,
  SymposiumArchiveItemDto,
  UpdateAnnouncementDto,
  UpdateSymposiumArchiveItemDto,
  UpsertSymposiumArchiveItemDto,
} from "../dto";
import { type PaginationParams, fetchPaginatedList, toPaginationQuery, unwrapPaginated } from "../helpers";

export const announcementsService = {
  listPublished(params?: PaginationParams & { symposiumId?: string }) {
    const { symposiumId, ...pagination } = params ?? {};
    const match = symposiumId ? (item: AnnouncementDto) => item.symposiumId === symposiumId : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<AnnouncementDto[]>>("/announcements", { params: toPaginationQuery(pg) })
          .then(unwrapPaginated),
      { pagination, match },
    );
  },
  getBySlug(slug: string) {
    return apiClient.get<ApiResponse<AnnouncementDto>>(`/announcements/${slug}`).then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string }) {
    const { symposiumId, ...pagination } = params ?? {};
    const match = symposiumId ? (item: AnnouncementDto) => item.symposiumId === symposiumId : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<AnnouncementDto[]>>("/announcements/admin/list", {
            params: toPaginationQuery(pg),
          })
          .then(unwrapPaginated),
      { pagination, match },
    );
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
  listArchivePublic(symposiumId: string) {
    return apiClient
      .get<ApiResponse<SymposiumArchiveItemDto[]>>(`/announcements/symposium-archive/${symposiumId}`)
      .then(unwrapApi);
  },
  listArchiveAdmin(symposiumId: string) {
    return apiClient
      .get<ApiResponse<SymposiumArchiveItemDto[]>>(`/announcements/admin/symposium-archive/${symposiumId}`)
      .then(unwrapApi);
  },
  createArchiveItem(dto: UpsertSymposiumArchiveItemDto) {
    return apiClient
      .post<ApiResponse<SymposiumArchiveItemDto>>("/announcements/admin/symposium-archive", dto)
      .then(unwrapApi);
  },
  updateArchiveItem(id: string, dto: UpdateSymposiumArchiveItemDto) {
    return apiClient
      .patch<ApiResponse<SymposiumArchiveItemDto>>(`/announcements/admin/symposium-archive/${id}`, dto)
      .then(unwrapApi);
  },
  removeArchiveItem(id: string) {
    return apiClient.delete(`/announcements/admin/symposium-archive/${id}`);
  },
};
