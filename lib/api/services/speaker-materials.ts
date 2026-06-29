import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  CreateSpeakerMaterialDto,
  SpeakerMaterialDto,
  UpdateSpeakerMaterialEquipmentDto,
} from "../dto";

export const speakerMaterialsService = {
  listForSession(sessionId: string) {
    return apiClient
      .get<ApiResponse<SpeakerMaterialDto[]>>(`/sessions/${sessionId}/materials`)
      .then(unwrapApi);
  },
  createForSession(sessionId: string, dto: CreateSpeakerMaterialDto) {
    return apiClient
      .post<ApiResponse<SpeakerMaterialDto>>(`/sessions/${sessionId}/materials`, dto)
      .then(unwrapApi);
  },
  updateEquipment(id: string, dto: UpdateSpeakerMaterialEquipmentDto) {
    return apiClient
      .patch<ApiResponse<SpeakerMaterialDto>>(`/materials/${id}`, dto)
      .then(unwrapApi);
  },
};
