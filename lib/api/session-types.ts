/** Values accepted by `POST/PATCH /sessions/admin` (`SessionType` enum on the API). */
export const API_SESSION_TYPES = [
  "keynote",
  "plenary",
  "parallel",
  "panel",
  "workshop",
  "breakout",
  "break",
  "networking",
  "ceremony",
  "other",
] as const;

export type ApiSessionType = (typeof API_SESSION_TYPES)[number];

export const DEFAULT_SESSION_TYPE: ApiSessionType = "parallel";

export function sessionTypeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}
