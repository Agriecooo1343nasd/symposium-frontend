import type { Speaker } from "@/lib/mock-data";
import type { SpeakerDto } from "../dto";

export function mapSpeakerDto(dto: SpeakerDto, sessionIds: string[] = []): Speaker {
  return {
    id: dto.id,
    name: dto.name,
    title: dto.title ?? "",
    org: dto.organization ?? "",
    country: dto.country ?? "",
    flag: "",
    bio: dto.bio ?? "",
    photo: dto.photoUrl ?? "",
    featured: dto.isFeatured ?? dto.isKeynote ?? false,
    sessions: sessionIds,
  };
}

export function mapSpeakers(dtos: SpeakerDto[]): Speaker[] {
  return dtos.map((dto) => mapSpeakerDto(dto));
}
