import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  SponsorDto,
  SponsorshipApplicationDto,
  SponsorshipApplicationStatsDto,
  SponsorshipInvoiceDto,
  SponsorshipTierPricingDto,
} from "../dto";
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
  getSponsorshipTierPricing(symposiumId: string) {
    return apiClient
      .get<ApiResponse<SponsorshipTierPricingDto[]>>(`/symposiums/${symposiumId}/sponsorship-tier-pricing`)
      .then(unwrapApi);
  },
  createSponsorshipApplication(dto: {
    symposiumId?: string;
    organizationName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    desiredTier: "platinum" | "gold" | "silver";
    message?: string;
    wantsExhibitorBooth: boolean;
    preferredBoothId?: string;
    staffCount?: number;
  }) {
    return apiClient
      .post<ApiResponse<SponsorshipApplicationDto>>("/sponsorship-applications", dto)
      .then(unwrapApi);
  },
  getMySponsorProfile() {
    return apiClient.get<ApiResponse<SponsorDto>>("/sponsors/me").then(unwrapApi);
  },
  updateMySponsorProfile(dto: { logoUrl?: string; websiteUrl?: string; description?: string }) {
    return apiClient.patch<ApiResponse<SponsorDto>>("/sponsors/me", dto).then(unwrapApi);
  },
  getMySponsorInvoice() {
    return apiClient.get<ApiResponse<SponsorshipInvoiceDto>>("/sponsors/me/invoice").then(unwrapApi);
  },
  listSponsorshipApplications(params?: PaginationParams & { symposiumId?: string; status?: string }) {
    const { symposiumId, status, ...pagination } = params ?? {};
    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<SponsorshipApplicationDto[]>>("/sponsorship-applications/admin/list", {
            params: { ...toPaginationQuery(pg), symposiumId, status },
          })
          .then(unwrapPaginated),
      { pagination },
    );
  },
  getSponsorshipApplicationStats(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<SponsorshipApplicationStatsDto>>("/sponsorship-applications/admin/stats", {
        params: symposiumId ? { symposiumId } : undefined,
      })
      .then(unwrapApi);
  },
  getSponsorshipApplication(id: string) {
    return apiClient
      .get<ApiResponse<SponsorshipApplicationDto>>(`/sponsorship-applications/admin/${id}`)
      .then(unwrapApi);
  },
  approveSponsorshipApplication(
    id: string,
    dto?: {
      tier?: string;
      adminNotes?: string;
      sortOrder?: number;
      createExhibitorBooth?: boolean;
      boothNumber?: string;
      boothId?: string;
      packageId?: string;
      markInvoiced?: boolean;
    },
  ) {
    return apiClient
      .post<ApiResponse<SponsorshipApplicationDto>>(`/sponsorship-applications/admin/${id}/approve`, dto)
      .then(unwrapApi);
  },
  rejectSponsorshipApplication(id: string, dto?: { adminNotes?: string }) {
    return apiClient
      .post<ApiResponse<SponsorshipApplicationDto>>(`/sponsorship-applications/admin/${id}/reject`, dto)
      .then(unwrapApi);
  },
  markSponsorshipApplicationInvoiced(id: string) {
    return apiClient
      .patch<ApiResponse<SponsorshipApplicationDto>>(`/sponsorship-applications/admin/${id}/invoiced`)
      .then(unwrapApi);
  },
  getSponsorshipApplicationInvoice(id: string) {
    return apiClient
      .get<ApiResponse<SponsorshipInvoiceDto | null>>(`/sponsorship-applications/admin/${id}/invoice`)
      .then(unwrapApi);
  },
  markSponsorshipInvoicePaid(id: string, dto?: { notes?: string }) {
    return apiClient
      .patch<ApiResponse<SponsorshipInvoiceDto>>(`/sponsorship-invoices/admin/${id}/paid`, dto)
      .then(unwrapApi);
  },
  addExhibitorBoothToSponsor(sponsorId: string, dto: { boothNumber: string; packageId?: string }) {
    return apiClient.post<ApiResponse<SponsorDto>>(`/sponsors/admin/${sponsorId}/booth`, dto).then(unwrapApi);
  },
};
