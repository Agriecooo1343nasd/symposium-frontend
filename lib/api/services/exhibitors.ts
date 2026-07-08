import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateExhibitorApplicationDto,
  CreateExhibitorDto,
  CreateExhibitorMaterialDto,
  CreateExhibitorPackageDto,
  CreateExhibitorStaffPassDto,
  ExhibitorApplicationDto,
  ExhibitorApplicationStatsDto,
  ExhibitorInvoiceDto,
  ExhibitorAdminDto,
  ExhibitorLeadDto,
  ExhibitorMaterialDto,
  ExhibitorPackageDto,
  ExhibitorProfileDto,
  ExhibitorStaffPassDto,
  ScanExhibitorLeadDto,
  UpdateExhibitorDto,
  UpdateExhibitorPackageDto,
  UpdateExhibitorProfileDto,
} from "../dto";
import { type PaginationParams, fetchPaginatedList, toQueryParams, unwrapPaginated } from "../helpers";

export const exhibitorsService = {
  getMyProfile() {
    return apiClient.get<ApiResponse<ExhibitorProfileDto>>("/exhibitors/me").then(unwrapApi);
  },
  updateMyProfile(dto: UpdateExhibitorProfileDto) {
    return apiClient.patch<ApiResponse<ExhibitorProfileDto>>("/exhibitors/me", dto).then(unwrapApi);
  },
  listMyMaterials() {
    return apiClient
      .get<ApiResponse<ExhibitorMaterialDto[]>>("/exhibitors/me/materials")
      .then(unwrapApi);
  },
  addMaterial(dto: CreateExhibitorMaterialDto) {
    return apiClient
      .post<ApiResponse<ExhibitorMaterialDto>>("/exhibitors/me/materials", dto)
      .then(unwrapApi);
  },
  removeMaterial(id: string) {
    return apiClient.delete(`/exhibitors/me/materials/${id}`);
  },
  listStaffPasses() {
    return apiClient
      .get<ApiResponse<ExhibitorStaffPassDto[]>>("/exhibitors/me/staff-passes")
      .then(unwrapApi);
  },
  createStaffPass(dto: CreateExhibitorStaffPassDto) {
    return apiClient
      .post<ApiResponse<ExhibitorStaffPassDto>>("/exhibitors/me/staff-passes", dto)
      .then(unwrapApi);
  },
  removeStaffPass(id: string) {
    return apiClient.delete(`/exhibitors/me/staff-passes/${id}`);
  },
  scanLead(dto: ScanExhibitorLeadDto) {
    return apiClient
      .post<ApiResponse<ExhibitorLeadDto>>("/exhibitors/leads/scan", dto)
      .then(unwrapApi);
  },
  listAdmin(params?: PaginationParams & { symposiumId?: string }) {
    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<ExhibitorAdminDto[]>>("/exhibitors/admin/list", {
            params: toQueryParams({
              symposiumId: params?.symposiumId,
              page: pg.page,
              limit: pg.limit,
              sort: pg.sort,
              search: pg.search,
            }),
          })
          .then(unwrapPaginated),
      {
        pagination: {
          page: params?.page,
          limit: params?.limit,
          sort: params?.sort,
          search: params?.search,
        },
      },
    );
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<ExhibitorAdminDto>>(`/exhibitors/admin/${id}`).then(unwrapApi);
  },
  createAdmin(dto: CreateExhibitorDto) {
    return apiClient.post<ApiResponse<ExhibitorAdminDto>>("/exhibitors/admin", dto).then(unwrapApi);
  },
  updateAdmin(id: string, dto: UpdateExhibitorDto) {
    return apiClient.patch<ApiResponse<ExhibitorAdminDto>>(`/exhibitors/admin/${id}`, dto).then(unwrapApi);
  },
  removeAdmin(id: string) {
    return apiClient.delete(`/exhibitors/admin/${id}`);
  },
  listPackages(symposiumId: string) {
    return apiClient
      .get<ApiResponse<ExhibitorPackageDto[]>>(`/symposiums/${symposiumId}/exhibitor-packages`)
      .then(unwrapApi);
  },
  listPackagesAdmin(symposiumId: string) {
    return apiClient
      .get<ApiResponse<ExhibitorPackageDto[]>>("/exhibitors/packages", {
        params: { symposiumId },
      })
      .then(unwrapApi);
  },
  createPackage(dto: CreateExhibitorPackageDto) {
    return apiClient.post<ApiResponse<ExhibitorPackageDto>>("/exhibitors/packages", dto).then(unwrapApi);
  },
  updatePackage(id: string, dto: UpdateExhibitorPackageDto) {
    return apiClient.patch<ApiResponse<ExhibitorPackageDto>>(`/exhibitors/packages/${id}`, dto).then(unwrapApi);
  },
  removePackage(id: string) {
    return apiClient.delete(`/exhibitors/packages/${id}`);
  },
  getPackage(id: string) {
    return apiClient.get<ApiResponse<ExhibitorPackageDto>>(`/exhibitors/packages/${id}`).then(unwrapApi);
  },
  listMyLeads() {
    return apiClient
      .get<ApiResponse<ExhibitorLeadDto[]>>("/exhibitors/me/leads")
      .then(unwrapApi);
  },
  createApplication(dto: CreateExhibitorApplicationDto) {
    return apiClient
      .post<ApiResponse<ExhibitorApplicationDto>>("/exhibitor-applications", dto)
      .then(unwrapApi);
  },
  listMyApplications() {
    return apiClient
      .get<ApiResponse<ExhibitorApplicationDto[]>>("/exhibitor-applications/me")
      .then(unwrapApi);
  },
  listApplicationsAdmin(params?: PaginationParams & { symposiumId?: string; status?: string }) {
    const { symposiumId, status, ...pagination } = params ?? {};
    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<ExhibitorApplicationDto[]>>("/exhibitor-applications/admin/list", {
            params: toQueryParams({
              symposiumId,
              status,
              page: pg.page,
              limit: pg.limit,
              sort: pg.sort,
              search: pg.search,
            }),
          })
          .then(unwrapPaginated),
      { pagination },
    );
  },
  getApplicationStats(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<ExhibitorApplicationStatsDto>>("/exhibitor-applications/admin/stats", {
        params: symposiumId ? { symposiumId } : undefined,
      })
      .then(unwrapApi);
  },
  getApplicationAdmin(id: string) {
    return apiClient
      .get<ApiResponse<ExhibitorApplicationDto>>(`/exhibitor-applications/admin/${id}`)
      .then(unwrapApi);
  },
  approveApplication(
    id: string,
    dto?: { packageId?: string; boothId?: string; boothNumber?: string; adminNotes?: string },
  ) {
    return apiClient
      .post<ApiResponse<ExhibitorApplicationDto>>(`/exhibitor-applications/admin/${id}/approve`, dto ?? {})
      .then(unwrapApi);
  },
  rejectApplication(id: string, dto?: { adminNotes?: string }) {
    return apiClient
      .post<ApiResponse<ExhibitorApplicationDto>>(`/exhibitor-applications/admin/${id}/reject`, dto ?? {})
      .then(unwrapApi);
  },
  getApplicationInvoice(id: string) {
    return apiClient
      .get<ApiResponse<ExhibitorInvoiceDto | null>>(`/exhibitor-applications/admin/${id}/invoice`)
      .then(unwrapApi);
  },
  markInvoicePaid(id: string, dto?: { notes?: string }) {
    return apiClient
      .patch<ApiResponse<ExhibitorInvoiceDto>>(`/exhibitor-invoices/admin/${id}/paid`, dto ?? {})
      .then(unwrapApi);
  },
};
