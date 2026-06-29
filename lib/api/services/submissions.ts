import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CreateSubmissionDto, SubmissionDto } from "../dto";

export const submissionsService = {
  listMine() {
    return apiClient.get<ApiResponse<SubmissionDto[]>>("/submissions/me").then(unwrapApi);
  },
  create(dto: CreateSubmissionDto) {
    return apiClient.post<ApiResponse<SubmissionDto>>("/submissions", dto).then(unwrapApi);
  },
  getById(id: string) {
    return apiClient.get<ApiResponse<SubmissionDto>>(`/submissions/${id}`).then(unwrapApi);
  },
};
