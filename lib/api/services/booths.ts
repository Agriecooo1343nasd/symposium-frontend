import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  ExhibitionBoothDto,
  UpdateExhibitionBoothDto,
  UpsertExhibitionBoothDto,
} from "../dto";

export const boothsService = {
  listBySymposium(symposiumId: string) {
    return apiClient
      .get<ApiResponse<ExhibitionBoothDto[]>>(`/symposiums/${symposiumId}/booths`)
      .then(unwrapApi);
  },
  create(dto: UpsertExhibitionBoothDto) {
    return apiClient.post<ApiResponse<ExhibitionBoothDto>>("/booths/admin", dto).then(unwrapApi);
  },
  update(id: string, dto: UpdateExhibitionBoothDto) {
    return apiClient
      .patch<ApiResponse<ExhibitionBoothDto>>(`/booths/admin/${id}`, dto)
      .then(unwrapApi);
  },
  remove(id: string) {
    return apiClient.delete(`/booths/admin/${id}`);
  },
};
