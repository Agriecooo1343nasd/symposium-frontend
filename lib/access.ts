import { getSession } from "./auth";
import { loadStore } from "./store";
import type { Role, Session, SessionVisibility } from "./mock-data";

export function sessionVisibility(session: Session): SessionVisibility {
  return session.visibility ?? "public";
}

const PAID_ROLES: Role[] = ["attendee", "speaker", "exhibitor", "moderator", "registration_desk", "admin"];

export function hasPaidOrPrivilegedAccess(email?: string, role?: Role): boolean {
  if (!role) return false;
  if (role === "admin" || role === "registration_desk" || role === "moderator" || role === "speaker" || role === "exhibitor") {
    return true;
  }
  if (role !== "attendee" || !email) return false;
  const reg = loadStore().registrations.find((r) => r.email === email);
  return reg?.status === "paid" || reg?.status === "comp";
}

export function canViewSessionMaterials(): boolean {
  const session = getSession();
  if (!session) return false;
  return hasPaidOrPrivilegedAccess(session.email, session.role);
}

/** Programme listing & session detail pages (subscribers-only sessions). */
export function canViewSessionProgramme(session: Session): boolean {
  if (sessionVisibility(session) === "public") return true;
  const auth = getSession();
  return hasPaidOrPrivilegedAccess(auth?.email, auth?.role);
}
