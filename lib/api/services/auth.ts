import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  AuthTokensDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "../dto";

export const authService = {
  login(dto: LoginDto) {
    return apiClient.post<ApiResponse<AuthTokensDto>>("/auth/login", dto).then(unwrapApi);
  },
  register(dto: RegisterDto) {
    return apiClient.post<ApiResponse<AuthTokensDto>>("/auth/register", dto).then(unwrapApi);
  },
  refresh(dto: RefreshDto) {
    return apiClient.post<ApiResponse<AuthTokensDto>>("/auth/refresh", dto).then(unwrapApi);
  },
  logout(dto: RefreshDto) {
    return apiClient.post<ApiResponse<{ message: string }>>("/auth/logout", dto).then(unwrapApi);
  },
  verifyEmail(dto: VerifyEmailDto) {
    return apiClient.post<ApiResponse<{ message: string }>>("/auth/verify-email", dto).then(unwrapApi);
  },
  forgotPassword(dto: ForgotPasswordDto) {
    return apiClient.post<ApiResponse<{ message: string }>>("/auth/forgot-password", dto).then(unwrapApi);
  },
  resetPassword(dto: ResetPasswordDto) {
    return apiClient.post<ApiResponse<{ message: string }>>("/auth/reset-password", dto).then(unwrapApi);
  },
};
