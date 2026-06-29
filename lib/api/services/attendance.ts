import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  AttendanceCheckInResponseDto,
  AttendanceHistoryResponseDto,
  ManualCheckInDto,
  PendingVerificationDto,
  QrCheckInDto,
  VerifyChecklistDto,
} from "../dto";

export const attendanceService = {
  checkInQr(dto: QrCheckInDto) {
    return apiClient
      .post<ApiResponse<AttendanceCheckInResponseDto>>("/attendance/check-in/qr", dto)
      .then(unwrapApi);
  },
  checkInManual(dto: ManualCheckInDto) {
    return apiClient
      .post<ApiResponse<AttendanceCheckInResponseDto>>("/attendance/check-in/manual", dto)
      .then(unwrapApi);
  },
  getHistory(registrationId: string) {
    return apiClient
      .get<ApiResponse<AttendanceHistoryResponseDto>>(`/attendance/registrations/${registrationId}`)
      .then(unwrapApi);
  },
  getPendingVerifications() {
    return apiClient
      .get<ApiResponse<PendingVerificationDto[]>>("/attendance/pending-verifications")
      .then(unwrapApi);
  },
  verifyChecklist(registrationId: string, dto: VerifyChecklistDto) {
    return apiClient
      .post<ApiResponse<Record<string, unknown>>>(`/attendance/registrations/${registrationId}/verify`, dto)
      .then(unwrapApi);
  },
};
