import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateSurveyDto,
  SubmitSurveyResponseDto,
  SurveyDto,
  SurveyResponseRecordDto,
  SurveyResultsDto,
  UpdateSurveyDto,
} from "../dto";

export const surveysService = {
  listActive(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<SurveyDto[]>>("/surveys/active", { params: symposiumId ? { symposiumId } : {} })
      .then(unwrapApi);
  },
  submitResponse(id: string, dto: SubmitSurveyResponseDto) {
    return apiClient
      .post<ApiResponse<SurveyResponseRecordDto>>(`/surveys/${id}/responses`, dto)
      .then(unwrapApi);
  },
  listAdmin(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<SurveyDto[]>>("/surveys/admin/list", { params: symposiumId ? { symposiumId } : {} })
      .then(unwrapApi);
  },
  getAdmin(id: string) {
    return apiClient.get<ApiResponse<SurveyDto>>(`/surveys/admin/${id}`).then(unwrapApi);
  },
  create(dto: CreateSurveyDto) {
    return apiClient.post<ApiResponse<SurveyDto>>("/surveys/admin", dto).then(unwrapApi);
  },
  update(id: string, dto: UpdateSurveyDto) {
    return apiClient.patch<ApiResponse<SurveyDto>>(`/surveys/admin/${id}`, dto).then(unwrapApi);
  },
  remove(id: string) {
    return apiClient.delete(`/surveys/admin/${id}`);
  },
  results(id: string) {
    return apiClient.get<ApiResponse<SurveyResultsDto>>(`/admin/surveys/${id}/results`).then(unwrapApi);
  },
};
