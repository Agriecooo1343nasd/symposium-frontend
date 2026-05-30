import { SESSIONS, type Session } from "./mock-data";
import { canViewSessionProgramme } from "./access";
import { loadStore } from "./store";

export function getSessions(): Session[] {
  const store = loadStore();
  return store.sessions?.length ? store.sessions : SESSIONS;
}

export function getSessionById(id: string): Session | undefined {
  return getSessions().find((s) => s.id === id);
}

/** Sessions visible on public programme listings (respects visibility). */
export function getProgrammeSessions(): Session[] {
  return getSessions().filter(canViewSessionProgramme);
}
