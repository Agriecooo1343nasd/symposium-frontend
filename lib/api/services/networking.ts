import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  ConnectionMessageDto,
  ConnectionRequestDto,
  CreateConnectionMessageDto,
  CreateConnectionRequestDto,
  DirectoryUserDto,
  NetworkingDirectoryParams,
  UpdateConnectionStatusDto,
} from "../dto";
import { toQueryParams, unwrapPaginated } from "../helpers";

export const networkingService = {
  directory(params?: NetworkingDirectoryParams) {
    return apiClient
      .get<ApiResponse<DirectoryUserDto[]>>("/networking/directory", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  requestConnection(dto: CreateConnectionRequestDto) {
    return apiClient
      .post<ApiResponse<ConnectionRequestDto>>("/networking/connections", dto)
      .then(unwrapApi);
  },
  updateConnection(id: string, dto: UpdateConnectionStatusDto) {
    return apiClient
      .patch<ApiResponse<ConnectionRequestDto>>(`/networking/connections/${id}`, dto)
      .then(unwrapApi);
  },
  listMessages(id: string) {
    return apiClient
      .get<ApiResponse<ConnectionMessageDto[]>>(`/networking/connections/${id}/messages`)
      .then(unwrapApi);
  },
  sendMessage(id: string, dto: CreateConnectionMessageDto) {
    return apiClient
      .post<ApiResponse<ConnectionMessageDto>>(`/networking/connections/${id}/messages`, dto)
      .then(unwrapApi);
  },
};
