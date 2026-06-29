import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { FinanceSummaryDto, FinanceTransactionDto } from "../dto";
import { type PaginationParams, toQueryParams, unwrapPaginated } from "../helpers";

export const financeService = {
  listTransactions(params?: PaginationParams & { symposiumId?: string; status?: string; method?: string }) {
    return apiClient
      .get<ApiResponse<FinanceTransactionDto[]>>("/finance/transactions", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  listRefunds(params?: PaginationParams & { symposiumId?: string; status?: string }) {
    return apiClient
      .get<ApiResponse<Record<string, unknown>[]>>("/finance/refunds", { params: toQueryParams(params) })
      .then(unwrapPaginated);
  },
  getSummary(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<FinanceSummaryDto>>("/finance/summary", {
        params: symposiumId ? { symposiumId } : {},
      })
      .then(unwrapApi);
  },
};
