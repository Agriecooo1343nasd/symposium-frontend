import type { Speaker } from "@/lib/mock-data";
import type { SpeakerDto } from "../dto";
import { speakerPhotoSrc } from "@/lib/utils";

export function mapSpeakerDto(dto: SpeakerDto, sessionIds: string[] = []): Speaker {
  return {
    id: dto.id,
    name: dto.name,
    title: dto.title ?? "",
    org: dto.organization ?? "",
    country: dto.country ?? "",
    flag: "",
    bio: dto.bio ?? "",
    photo: speakerPhotoSrc(dto.photoUrl) ?? "",
    featured: dto.isFeatured ?? dto.isKeynote ?? false,
    sessions: sessionIds,
  };
}

export function mapSpeakers(dtos: SpeakerDto[] | null | undefined): Speaker[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map((dto) => mapSpeakerDto(dto));
}
