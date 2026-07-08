import { getSession } from "./auth";
import { loadStore } from "./store";
import { normalizeBackendRoles, isAdminRole } from "./api/mappers/role";
import type { RegistrationView } from "./api/mappers/registration";
import type { Role, Session, SessionVisibility } from "./mock-data";

export function sessionVisibility(session: Session): SessionVisibility {
  return session.visibility ?? "public";
}

const PRIVILEGED_ROLES = new Set([
  "admin",
  "registration_desk",
  "moderator",
  "speaker",
  "exhibitor",
]);

const PAID_MOCK_STATUSES = new Set(["paid", "comp", "active"]);

function hasPaidMockRegistration(email?: string): boolean {
  if (!email) return false;
  const reg = loadStore().registrations.find((r) => r.email === email);
  return reg ? PAID_MOCK_STATUSES.has(reg.status) : false;
}

function hasPaidApiRegistration(registrations: RegistrationView[]): boolean {
  return registrations.some((r) => r.isPaid || r.isActive);
}

/** Shared gate for session materials + post-session ratings on the public programme. */
export function hasSessionMaterialsAccess(input: {
  roles?: string[];
  registrations?: RegistrationView[];
  email?: string;
}): boolean {
  const roles = normalizeBackendRoles(input.roles ?? []);
  if (roles.some((r) => isAdminRole(r) || PRIVILEGED_ROLES.has(r))) {
    return true;
  }
  if (roles.includes("attendee")) {
    if (hasPaidApiRegistration(input.registrations ?? [])) return true;
    return hasPaidMockRegistration(input.email);
  }
  return false;
}

/** @deprecated Prefer `useSessionMaterialsAccess()` in client components. */
export function hasPaidOrPrivilegedAccess(email?: string, role?: Role): boolean {
  return hasSessionMaterialsAccess({
    email,
    roles: role ? [role] : [],
    registrations: [],
  });
}

/** @deprecated Prefer `useSessionMaterialsAccess()` in client components. */
export function canViewSessionMaterials(): boolean {
  const session = getSession();
  if (!session) return false;
  return hasSessionMaterialsAccess({
    email: session.email,
    roles: [session.role],
  });
}

/** Programme listing & session detail pages (subscribers-only sessions). */
export function canViewSessionProgramme(session: Session): boolean {
  if (sessionVisibility(session) === "public") return true;
  const auth = getSession();
  return hasSessionMaterialsAccess({
    email: auth?.email,
    roles: auth?.role ? [auth.role] : [],
  });
}
