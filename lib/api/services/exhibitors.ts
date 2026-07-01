import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateExhibitorDto,
  CreateExhibitorMaterialDto,
  CreateExhibitorStaffPassDto,
  ExhibitorAdminDto,
  ExhibitorLeadDto,
  ExhibitorMaterialDto,
  ExhibitorPackageDto,
  ExhibitorProfileDto,
  ExhibitorStaffPassDto,
  ScanExhibitorLeadDto,
  UpdateExhibitorDto,
  UpdateExhibitorProfileDto,
} from "../dto";
import { type PaginationParams, fetchPaginatedList, toPaginationQuery, unwrapPaginated } from "../helpers";

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
    const { symposiumId, ...pagination } = params ?? {};
    const match = symposiumId ? (item: ExhibitorAdminDto) => item.symposiumId === symposiumId : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<ExhibitorAdminDto[]>>("/exhibitors/admin/list", {
            params: toPaginationQuery(pg),
          })
          .then(unwrapPaginated),
      { pagination, match },
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
      .get<ApiResponse<ExhibitorPackageDto[]>>("/exhibitors/packages", { params: { symposiumId } })
      .then(unwrapApi);
  },
  getPackage(id: string) {
    return apiClient.get<ApiResponse<ExhibitorPackageDto>>(`/exhibitors/packages/${id}`).then(unwrapApi);
  },
};
