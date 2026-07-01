import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CreateResourceDto, ResourceDto } from "../dto";

export const resourcesService = {
  listPublic(symposiumId: string) {
    return apiClient
      .get<ApiResponse<ResourceDto[]>>("/resources", { params: { symposiumId } })
      .then(unwrapApi);
  },
  listLibrary(symposiumId: string) {
    return apiClient
      .get<ApiResponse<ResourceDto[]>>("/resources/library", { params: { symposiumId } })
      .then(unwrapApi);
  },
  create(dto: CreateResourceDto) {
    return apiClient.post<ApiResponse<ResourceDto>>("/resources/admin", dto).then(unwrapApi);
  },
};
