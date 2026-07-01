import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  AnalyticsDashboardDto,
  AnalyticsPeriod,
  AttendanceHeatmapCellDto,
  RevenuePeriodItemDto,
  TicketDistributionItemDto,
  TrendPointDto,
} from "../dto";

export const analyticsService = {
  getDashboard(symposiumId: string) {
    return apiClient
      .get<ApiResponse<AnalyticsDashboardDto>>("/analytics/dashboard", { params: { symposiumId } })
      .then(unwrapApi);
  },
  getRegistrationsTrend(symposiumId: string, period?: AnalyticsPeriod) {
    return apiClient
      .get<ApiResponse<TrendPointDto[]>>("/analytics/registrations-trend", {
        params: { symposiumId, period },
      })
      .then(unwrapApi);
  },
  getTicketDistribution(symposiumId: string) {
    return apiClient
      .get<ApiResponse<TicketDistributionItemDto[]>>("/analytics/ticket-distribution", {
        params: { symposiumId },
      })
      .then(unwrapApi);
  },
  getRevenueByPeriod(symposiumId: string, period?: AnalyticsPeriod) {
    return apiClient
      .get<ApiResponse<RevenuePeriodItemDto[]>>("/analytics/revenue-by-period", {
        params: { symposiumId, period },
      })
      .then(unwrapApi);
  },
  getAttendanceHeatmap(symposiumId: string) {
    return apiClient
      .get<ApiResponse<AttendanceHeatmapCellDto[]>>("/analytics/attendance-heatmap", {
        params: { symposiumId },
      })
      .then(unwrapApi);
  },
};
