import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  AdminDeadlineOverrideDto,
  AdminListSubmissionsParams,
  CreateSubmissionDto,
  SubmissionDecisionDto,
  SubmissionDto,
} from "../dto";
import { toQueryParams, fetchPaginatedList, unwrapPaginated } from "../helpers";

export const submissionsService = {
  listMine() {
    return apiClient.get<ApiResponse<SubmissionDto[]>>("/submissions/me").then(unwrapApi);
  },
  listAdmin(params?: AdminListSubmissionsParams) {
    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<SubmissionDto[]>>("/submissions", { params: toQueryParams({ ...params, ...pg }) })
          .then(unwrapPaginated),
      { pagination: params },
    );
  },
  create(dto: CreateSubmissionDto) {
    return apiClient.post<ApiResponse<SubmissionDto>>("/submissions", dto).then(unwrapApi);
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<SubmissionDto>>(`/submissions/${id}`).then(unwrapApi);
  },
  recordDecision(id: string, dto: SubmissionDecisionDto) {
    return apiClient
      .post<ApiResponse<{ message: string }>>(`/submissions/${id}/decision`, dto)
      .then(unwrapApi);
  },
  setDeadlineOverride(id: string, dto: AdminDeadlineOverrideDto) {
    return apiClient
      .patch<ApiResponse<SubmissionDto>>(`/submissions/${id}/deadline-override`, dto)
      .then(unwrapApi);
  },
};
