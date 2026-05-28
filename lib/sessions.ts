import { SESSIONS, type Session } from "./mock-data";
import { loadStore } from "./store";

export function getSessions(): Session[] {
  const store = loadStore();
  return store.sessions?.length ? store.sessions : SESSIONS;
}

export function getSessionById(id: string): Session | undefined {
  return getSessions().find((s) => s.id === id);
}
