import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CmsPageDto, CreateContactMessageDto, FaqDto } from "../dto";

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
};
