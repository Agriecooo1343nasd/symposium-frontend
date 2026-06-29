import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { UploadFileResponseDto, UploadFileType } from "../dto";

export const filesService = {
  upload(file: File, type: UploadFileType) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<ApiResponse<UploadFileResponseDto>>("/files/upload", formData, {
        params: { type },
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrapApi);
  },
};
