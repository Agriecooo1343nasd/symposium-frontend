import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { AttendanceCheckInDto } from "../dto";

export const attendanceService = {
  checkInQr(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<AttendanceCheckInDto>>("/attendance/check-in/qr", dto).then(unwrapApi);
  },
  checkInManual(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<AttendanceCheckInDto>>("/attendance/check-in/manual", dto).then(unwrapApi);
  },
  bulkCheckIn(dto: Record<string, unknown>) {
    return apiClient.post<ApiResponse<Record<string, unknown>>>("/attendance/check-in/bulk", dto).then(unwrapApi);
  },
  getHistory(registrationId: string) {
    return apiClient
      .get<ApiResponse<Record<string, unknown>>>(`/attendance/registrations/${registrationId}`)
      .then(unwrapApi);
  },
  getPendingVerifications() {
    return apiClient.get<ApiResponse<Record<string, unknown>[]>>("/attendance/pending-verifications").then(unwrapApi);
  },
  verifyChecklist(registrationId: string, dto: Record<string, unknown>) {
    return apiClient
      .post<ApiResponse<Record<string, unknown>>>(`/attendance/registrations/${registrationId}/verify`, dto)
      .then(unwrapApi);
  },
};
