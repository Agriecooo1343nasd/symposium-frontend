import type { Role } from "@/lib/mock-data";

// Backend now uses 6 canonical roles only (per SRS FR-5.1 changes)
export type BackendRole =
  | "admin"
  | "registration_desk"
  | "moderator"
  | "attendee"
  | "speaker"
  | "exhibitor";

const ADMIN_ROLES: BackendRole[] = ["admin"];

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as BackendRole);
}

// Map legacy roles to canonical roles for backward compatibility
const LEGACY_ROLE_MAPPING: Record<string, BackendRole> = {
  super_admin: "admin",
  finance_officer: "admin",
  programme_committee: "admin",
  program_admin: "admin",
  content_manager: "admin",
  exhibitor_manager: "admin",
  reviewer: "moderator",
  exhibitor_contact: "exhibitor",
  media_press: "registration_desk",
  media: "registration_desk",
};

export function resolveLegacyRole(roles: string[]): Role {
  if (roles.length === 0) return "attendee";
  
  // Map any legacy roles to canonical roles
  const canonicalRoles = roles.map(role => LEGACY_ROLE_MAPPING[role] || role as BackendRole);
  
  if (canonicalRoles.includes("admin")) return "admin";
  if (canonicalRoles.includes("registration_desk")) return "registration_desk";
  if (canonicalRoles.includes("moderator")) return "moderator";
  if (canonicalRoles.includes("speaker")) return "speaker";
  if (canonicalRoles.includes("exhibitor")) return "exhibitor";
  return "attendee";
}

export function roleLabelFromBackend(role: string): string {
  const labels: Record<string, string> = {
    admin: "Admin",
    registration_desk: "Registration Desk",
    moderator: "Moderator",
    speaker: "Speaker",
    attendee: "Attendee",
    exhibitor: "Exhibitor",
  };
  return labels[role] ?? role.replace(/_/g, " ");
}
