import type { CreateSessionDto, SessionDto, UpdateSessionDto } from "@/lib/api/dto";
import { mapSessionDto } from "@/lib/api/mappers/session";
import type { ApiSessionType } from "@/lib/api/session-types";
import type { Session } from "@/lib/mock-data";
import { getEventConfig } from "@/lib/platform-settings";
import { getSessionExtras, saveSessionExtras, extrasFromSession } from "@/lib/session-extras-storage";

const UI_TO_API_TYPE: Record<Session["type"], ApiSessionType> = {
  Keynote: "keynote",
  Plenary: "plenary",
  Panel: "panel",
  Workshop: "workshop",
  "Field Visit": "other",
};

function timeToIso(day: 1 | 2, time: string): string | undefined {
  if (!time) return undefined;
  const event = getEventConfig();
  const base = new Date(event.startDate);
  if (day === 2) base.setDate(base.getDate() + 1);
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
  base.setHours(h, m, 0, 0);
  return base.toISOString();
}

export function sessionFormToApiDto(form: Session, symposiumId: string): CreateSessionDto {
  return {
    symposiumId,
    title: form.title.trim(),
    description: form.description.trim() || form.longDescription?.trim() || undefined,
    sessionType: UI_TO_API_TYPE[form.type] ?? "parallel",
    dayIndex: form.day,
    room: form.room.trim() || undefined,
    startTime: timeToIso(form.day, form.start),
    endTime: timeToIso(form.day, form.end),
    isPublished: (form.visibility ?? "public") === "public",
    speakers: form.speakers.map((speakerId, i) => ({ speakerId, role: i === 0 ? "lead" : "panelist" })),
  };
}

export function sessionFormToUpdateDto(form: Session, symposiumId: string): UpdateSessionDto {
  return sessionFormToApiDto(form, symposiumId);
}

export function apiSessionToForm(dto: SessionDto): Session {
  const base = mapSessionDto(dto);
  const extras = getSessionExtras(dto.id);
  return {
    ...base,
    longDescription: extras?.longDescription ?? base.description,
    learningObjectives: extras?.learningObjectives ?? [""],
    subTheme: extras?.subTheme ?? base.subTheme,
    capacity: extras?.capacity ?? 100,
    prerequisites: extras?.prerequisites,
    visibility: extras?.visibility ?? (dto.isPublished ? "public" : "subscribers"),
  };
}

export function persistSessionExtras(form: Session) {
  saveSessionExtras(form.id, extrasFromSession(form));
}
