import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { SponsorDto } from "../dto";
import { type PaginationParams, fetchPaginatedList, toPaginationQuery, unwrapPaginated } from "../helpers";

export const sponsorsService = {
  listBySymposium(symposiumId: string) {
    return apiClient
      .get<ApiResponse<SponsorDto[]>>(`/symposiums/${symposiumId}/sponsors`)
      .then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string }) {
    const { symposiumId, ...pagination } = params ?? {};
    const match = symposiumId ? (item: SponsorDto) => item.symposiumId === symposiumId : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<SponsorDto[]>>("/sponsors/admin/list", { params: toPaginationQuery(pg) })
          .then(unwrapPaginated),
      { pagination, match },
    );
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<SponsorDto>>(`/sponsors/admin/${id}`).then(unwrapApi);
  },
  create(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<SponsorDto>>("/sponsors/admin", dto).then(unwrapApi);
  },
  update(id: string, dto: Record<string, unknown>) {
    return apiClient.patch<ApiResponse<SponsorDto>>(`/sponsors/admin/${id}`, dto).then(unwrapApi);
  },
  remove(id: string) {
    return apiClient.delete(`/sponsors/admin/${id}`);
  },
};
