import axios from "axios";
import { apiErrorMessage } from "@/lib/api/client";
import { cmsService } from "@/lib/api/services/cms";
import type { CreateMediaAccreditationAdminDto, CreateMediaAccreditationAdminResultDto } from "@/lib/api/dto";
import {
  isMockMediaAccreditationId,
  mockCreateMediaAccreditationAdmin,
  mockUpdateMediaAccreditation,
} from "@/lib/media-accreditation-admin-mock";
import type { UpdateMediaAccreditationDto } from "@/lib/api/dto";

function isMissingAdminEndpoint(error: unknown) {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 404 || status === 405 || status === 501;
}

export async function createMediaAccreditationAsAdmin(
  dto: CreateMediaAccreditationAdminDto,
): Promise<CreateMediaAccreditationAdminResultDto> {
  try {
    const result = await cmsService.createMediaAccreditationAdmin(dto);
    return { ...result, simulated: false };
  } catch (error) {
    if (isMissingAdminEndpoint(error)) {
      return mockCreateMediaAccreditationAdmin(dto);
    }
    throw new Error(apiErrorMessage(error));
  }
}

export async function updateMediaAccreditationAsAdmin(id: string, dto: UpdateMediaAccreditationDto) {
  if (isMockMediaAccreditationId(id)) {
    return mockUpdateMediaAccreditation(id, dto);
  }
  return cmsService.updateMediaAccreditation(id, dto);
}
