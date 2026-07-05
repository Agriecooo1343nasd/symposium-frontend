import type { Session } from "@/lib/mock-data";

const KEY = "nas_session_extras";

export type SessionExtras = Pick<
  Session,
  "longDescription" | "learningObjectives" | "subTheme" | "capacity" | "prerequisites" | "visibility"
>;

function readAll(): Record<string, SessionExtras> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SessionExtras>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, SessionExtras>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getSessionExtras(id: string): SessionExtras | undefined {
  return readAll()[id];
}

export function saveSessionExtras(id: string, extras: SessionExtras) {
  const all = readAll();
  all[id] = extras;
  writeAll(all);
}

export function deleteSessionExtras(id: string) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function extrasFromSession(form: Session): SessionExtras {
  return {
    longDescription: form.longDescription,
    learningObjectives: form.learningObjectives,
    subTheme: form.subTheme,
    capacity: form.capacity,
    prerequisites: form.prerequisites,
    visibility: form.visibility,
  };
}
