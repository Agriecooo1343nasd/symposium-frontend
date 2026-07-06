import { apiClient, unwrapApi } from "../client";
import type { ApiResponse } from "../types";
import type {
  ReorderRunOfShowDto,
  RunOfShowItemDto,
  UpdateRunOfShowItemDto,
  UpdateVenueRoomDto,
  UpsertRunOfShowItemDto,
  UpsertVenueRoomDto,
  VenueRoomDto,
} from "../dto";

export const programmeService = {
  listRooms(symposiumId: string) {
    return apiClient
      .get<ApiResponse<VenueRoomDto[]>>(`/symposiums/${symposiumId}/rooms`)
      .then(unwrapApi);
  },
  createRoom(dto: UpsertVenueRoomDto) {
    return apiClient.post<ApiResponse<VenueRoomDto>>("/rooms/admin", dto).then(unwrapApi);
  },
  updateRoom(id: string, dto: UpdateVenueRoomDto) {
    return apiClient.patch<ApiResponse<VenueRoomDto>>(`/rooms/admin/${id}`, dto).then(unwrapApi);
  },
  removeRoom(id: string) {
    return apiClient.delete(`/rooms/admin/${id}`);
  },
  listRunOfShow(symposiumId: string, day?: number) {
    return apiClient
      .get<ApiResponse<RunOfShowItemDto[]>>(`/symposiums/${symposiumId}/run-of-show`, {
        params: day !== undefined ? { day } : undefined,
      })
      .then(unwrapApi);
  },
  createRunOfShowItem(dto: UpsertRunOfShowItemDto) {
    return apiClient
      .post<ApiResponse<RunOfShowItemDto>>("/run-of-show/admin", dto)
      .then(unwrapApi);
  },
  updateRunOfShowItem(id: string, dto: UpdateRunOfShowItemDto) {
    return apiClient
      .patch<ApiResponse<RunOfShowItemDto>>(`/run-of-show/admin/${id}`, dto)
      .then(unwrapApi);
  },
  removeRunOfShowItem(id: string) {
    return apiClient.delete(`/run-of-show/admin/${id}`);
  },
  reorderRunOfShow(dto: ReorderRunOfShowDto) {
    return apiClient
      .patch<ApiResponse<RunOfShowItemDto[]>>("/run-of-show/admin/reorder", dto)
      .then(unwrapApi);
  },
};
