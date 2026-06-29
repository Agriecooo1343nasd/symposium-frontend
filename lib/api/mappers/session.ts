import type { Session } from "@/lib/mock-data";
import type { SessionDto } from "../dto";

const SESSION_TYPES = ["Plenary", "Panel", "Workshop", "Field Visit", "Keynote"] as const;

function formatTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function mapSessionType(value: string): Session["type"] {
  const normalized = value.replace(/_/g, " ");
  if ((SESSION_TYPES as readonly string[]).includes(normalized)) {
    return normalized as Session["type"];
  }
  return "Plenary";
}

export function mapSessionDto(dto: SessionDto): Session {
  const day = (dto.dayIndex === 2 ? 2 : 1) as 1 | 2;
  return {
    id: dto.id,
    day,
    start: formatTime(dto.startTime),
    end: formatTime(dto.endTime),
    title: dto.title,
    description: dto.description ?? "",
    type: mapSessionType(dto.sessionType),
    room: dto.room ?? "",
    subTheme: "Food Systems",
    speakers: (dto.speakers ?? []).map((s) => s.id),
    visibility: dto.isPublished ? "public" : "subscribers",
  };
}

export function mapSessions(dtos: SessionDto[]): Session[] {
  return dtos.map(mapSessionDto);
}
