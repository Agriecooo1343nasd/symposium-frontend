import type { Role } from "./mock-data";

const PORTAL_ROLES: Record<string, Role[]> = {
  "/dashboard": ["attendee"],
  "/admin": ["admin"],
  "/desk": ["registration_desk", "admin"],
  "/moderator": ["moderator", "admin"],
  "/exhibitor": ["exhibitor", "admin"],
  "/speaker": ["speaker", "admin"],
};

export function canAccessPortal(pathname: string, role: Role | undefined): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  const prefix = Object.keys(PORTAL_ROLES).find((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!prefix) return true;
  return PORTAL_ROLES[prefix].includes(role);
}

export function roleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    attendee: "Attendee",
    admin: "Admin",
    registration_desk: "Registration Desk",
    moderator: "Moderator",
    exhibitor: "Exhibitor",
    speaker: "Speaker",
  };
  return labels[role];
}

export const ALL_ROLES: Role[] = [
  "admin",
  "registration_desk",
  "moderator",
  "attendee",
  "exhibitor",
  "speaker",
];
