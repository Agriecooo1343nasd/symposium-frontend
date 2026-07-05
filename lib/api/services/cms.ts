import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CmsPageDto,
  CommitteeMemberDto,
  ContactMessageInboxDto,
  CreateContactMessageDto,
  FaqDto,
  MediaAccreditationDto,
  MediaAccreditationStatsDto,
  MediaAccreditationStatus,
  UpdateMediaAccreditationDto,
  UpsertCmsPageDto,
  UpsertCommitteeMemberDto,
  UpsertFaqDto,
  CreateMediaAccreditationAdminDto,
  CreateMediaAccreditationAdminResultDto,
} from "../dto";
import { type PaginationParams, fetchPaginatedList, toPaginationQuery, toQueryParams, unwrapPaginated } from "../helpers";

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
  upsertPage(dto: UpsertCmsPageDto) {
    return apiClient.post<ApiResponse<CmsPageDto>>("/cms/admin/pages", dto).then(unwrapApi);
  },
  deletePage(id: string) {
    return apiClient.delete(`/cms/admin/pages/${id}`);
  },
  createFaq(dto: UpsertFaqDto) {
    return apiClient.post<ApiResponse<FaqDto>>("/cms/admin/faqs", dto).then(unwrapApi);
  },
  updateFaq(id: string, dto: UpsertFaqDto) {
    return apiClient.patch<ApiResponse<FaqDto>>(`/cms/admin/faqs/${id}`, dto).then(unwrapApi);
  },
  deleteFaq(id: string) {
    return apiClient.delete(`/cms/admin/faqs/${id}`);
  },
  listCommittee(symposiumId: string) {
    return apiClient
      .get<ApiResponse<CommitteeMemberDto[]>>("/cms/admin/committee-members", { params: { symposiumId } })
      .then(unwrapApi);
  },
  createCommittee(dto: UpsertCommitteeMemberDto) {
    return apiClient
      .post<ApiResponse<CommitteeMemberDto>>("/cms/admin/committee-members", dto)
      .then(unwrapApi);
  },
  updateCommittee(id: string, dto: UpsertCommitteeMemberDto) {
    return apiClient
      .patch<ApiResponse<CommitteeMemberDto>>(`/cms/admin/committee-members/${id}`, dto)
      .then(unwrapApi);
  },
  deleteCommittee(id: string) {
    return apiClient.delete(`/cms/admin/committee-members/${id}`);
  },
  listContactMessages(params?: PaginationParams) {
    return apiClient
      .get<ApiResponse<ContactMessageInboxDto[]>>("/cms/admin/contact-messages", {
        params: toQueryParams(params),
      })
      .then(unwrapPaginated);
  },
  listMediaAccreditations(params?: PaginationParams & { status?: MediaAccreditationStatus }) {
    const { status, ...pagination } = params ?? {};
    const match = status ? (item: MediaAccreditationDto) => item.status === status : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<MediaAccreditationDto[]>>("/cms/admin/media-accreditations", {
            params: toPaginationQuery(pg),
          })
          .then(unwrapPaginated),
      { pagination, match },
    );
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
  createMediaAccreditationAdmin(dto: CreateMediaAccreditationAdminDto) {
    return apiClient
      .post<ApiResponse<CreateMediaAccreditationAdminResultDto>>("/cms/admin/media-accreditations", dto)
      .then(unwrapApi);
  },
};
