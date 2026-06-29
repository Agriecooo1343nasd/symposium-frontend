import type { Role } from "@/lib/mock-data";

export type BackendRole =
  | "super_admin"
  | "finance_officer"
  | "programme_committee"
  | "program_admin"
  | "content_manager"
  | "registration_desk"
  | "exhibitor_manager"
  | "reviewer"
  | "speaker"
  | "attendee"
  | "exhibitor"
  | "exhibitor_contact"
  | "media"
  | "media_press";

const ADMIN_ROLES: BackendRole[] = [
  "super_admin",
  "finance_officer",
  "programme_committee",
  "program_admin",
  "content_manager",
  "exhibitor_manager",
  "reviewer",
];

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as BackendRole);
}

export function resolveLegacyRole(roles: string[]): Role {
  if (roles.some(isAdminRole)) return "admin";
  if (roles.includes("registration_desk")) return "registration_desk";
  if (roles.includes("media_press") || roles.includes("media")) return "registration_desk";
  if (roles.includes("speaker")) return "speaker";
  if (roles.includes("exhibitor_contact") || roles.includes("exhibitor")) return "exhibitor";
  if (roles.includes("programme_committee") || roles.includes("program_admin")) return "moderator";
  return "attendee";
}

export function roleLabelFromBackend(role: string): string {
  const labels: Record<string, string> = {
    super_admin: "Super Admin",
    finance_officer: "Finance Officer",
    programme_committee: "Programme Committee",
    program_admin: "Program Admin",
    content_manager: "Content Manager",
    registration_desk: "Registration Desk",
    exhibitor_manager: "Exhibitor Manager",
    reviewer: "Reviewer",
    speaker: "Speaker",
    attendee: "Attendee",
    exhibitor: "Exhibitor",
    exhibitor_contact: "Exhibitor Contact",
    media_press: "Media / Press",
    media: "Media",
  };
  return labels[role] ?? role.replace(/_/g, " ");
}
