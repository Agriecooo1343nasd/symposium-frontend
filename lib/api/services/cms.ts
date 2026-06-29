import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CmsPageDto,
  CreateContactMessageDto,
  FaqDto,
  MediaAccreditationDto,
  MediaAccreditationStatsDto,
  MediaAccreditationStatus,
  UpdateMediaAccreditationDto,
} from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const cmsService = {
  getPage(key: string, symposiumId?: string) {
    return apiClient
      .get<ApiResponse<CmsPageDto>>(`/cms/pages/${key}`, { params: symposiumId ? { symposiumId } : {} })
      .then(unwrapApi);
  },
  getFaqs(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<FaqDto[]>>("/cms/faqs", { params: symposiumId ? { symposiumId } : {} })
      .then(unwrapApi);
  },
  getPressKit(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<CmsPageDto>>("/cms/press-kit", { params: symposiumId ? { symposiumId } : {} })
      .then(unwrapApi);
  },
  submitContact(dto: CreateContactMessageDto) {
    return apiClient.post<ApiResponse<Record<string, unknown>>>("/contact-messages", dto).then(unwrapApi);
  },
  submitMediaAccreditation(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<Record<string, unknown>>>("/media-accreditation", dto).then(unwrapApi);
  },
  listPagesAdmin(symposiumId: string) {
    return apiClient.get<ApiResponse<CmsPageDto[]>>("/cms/admin/pages", { params: { symposiumId } }).then(unwrapApi);
  },
  upsertPage(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<CmsPageDto>>("/cms/admin/pages", dto).then(unwrapApi);
  },
  listMediaAccreditations(params?: PaginationParams & { status?: MediaAccreditationStatus }) {
    return apiClient
      .get<ApiResponse<MediaAccreditationDto[]>>("/cms/admin/media-accreditations", {
        params: toQueryParams(params),
      })
      .then(unwrapPaginated);
  },
  getMediaAccreditationStats() {
    return apiClient
      .get<ApiResponse<MediaAccreditationStatsDto>>("/cms/admin/media-accreditations/stats")
      .then(unwrapApi);
  },
  updateMediaAccreditation(id: string, dto: UpdateMediaAccreditationDto) {
    return apiClient
      .patch<ApiResponse<MediaAccreditationDto>>(`/cms/admin/media-accreditations/${id}`, dto)
      .then(unwrapApi);
  },
};
