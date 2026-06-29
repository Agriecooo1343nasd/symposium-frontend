import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { CertificateDto } from "../dto";

export const certificatesService = {
  listMine() {
    return apiClient.get<ApiResponse<CertificateDto[]>>("/certificates/me").then(unwrapApi);
  },
  generate(registrationId: string) {
    return apiClient
      .post<ApiResponse<CertificateDto>>(`/certificates/generate/${registrationId}`)
      .then(unwrapApi);
  },
};
