import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type { ReviewDto } from "../dto";

export const reviewsService = {
  listForSubmission(submissionId: string) {
    return apiClient
      .get<ApiResponse<ReviewDto[]>>(`/submissions/${submissionId}/reviews`)
      .then(unwrapApi);
  },
  assignReviewers(submissionId: string, reviewerIds: string[]) {
    return apiClient
      .post<ApiResponse<ReviewDto[]>>(`/submissions/${submissionId}/assign-reviewers`, { reviewerIds })
      .then(unwrapApi);
  },
};
