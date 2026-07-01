import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { FinanceRefundDto, FinanceSummaryDto, FinanceTransactionDto } from "../dto";
import { type PaginationParams, fetchPaginatedList, toPaginationQuery, unwrapPaginated } from "../helpers";

export const financeService = {
  listTransactions(params?: PaginationParams & { symposiumId?: string; status?: string; method?: string }) {
    const { symposiumId, status, method, ...pagination } = params ?? {};
    const match =
      symposiumId || status || method
        ? (item: FinanceTransactionDto) =>
            (!symposiumId || item.symposiumId === symposiumId) &&
            (!status || item.status === status) &&
            (!method || item.method === method)
        : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<FinanceTransactionDto[]>>("/finance/transactions", {
            params: toPaginationQuery(pg),
          })
          .then(unwrapPaginated),
      { pagination, match },
    );
  },
  listRefunds(params?: PaginationParams & { symposiumId?: string; status?: string }) {
    const { symposiumId, status, ...pagination } = params ?? {};
    const match =
      symposiumId || status
        ? (item: FinanceRefundDto) =>
            (!symposiumId || item.symposiumId === symposiumId) && (!status || item.status === status)
        : undefined;

    return fetchPaginatedList(
      (pg) =>
        apiClient
          .get<ApiResponse<FinanceRefundDto[]>>("/finance/refunds", { params: toPaginationQuery(pg) })
          .then(unwrapPaginated),
      { pagination, match },
    );
  },
  getSummary(symposiumId?: string) {
    return apiClient
      .get<ApiResponse<FinanceSummaryDto>>("/finance/summary", {
        params: symposiumId ? { symposiumId } : {},
      })
      .then(unwrapApi);
  },
};
