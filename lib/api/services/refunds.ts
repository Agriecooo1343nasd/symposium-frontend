import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CreateRefundRequestDto, RefundRequestDto } from "../dto";

export const refundsService = {
  listMine() {
    return apiClient.get<ApiResponse<RefundRequestDto[]>>("/refund-requests/me").then(unwrapApi);
  },
  create(dto: CreateRefundRequestDto) {
    return apiClient.post<ApiResponse<RefundRequestDto>>("/refund-requests", dto).then(unwrapApi);
  },
};
