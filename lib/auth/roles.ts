import type { Role } from "@/lib/mock-data";
import { isAdminRole, resolveLegacyRole } from "@/lib/api/mappers/role";

export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  SYMPOSIUM_READ: "symposium.read",
  SYMPOSIUM_MANAGE: "symposium.manage",
  SESSIONS_READ: "sessions.read",
  SESSIONS_MANAGE: "sessions.manage",
  SPEAKERS_MANAGE: "speakers.manage",
  CMS_READ: "cms.read",
  CMS_MANAGE: "cms.manage",
  ANNOUNCEMENTS_READ: "announcements.read",
  ANNOUNCEMENTS_MANAGE: "announcements.manage",
  SPONSORS_READ: "sponsors.read",
  SPONSORS_MANAGE: "sponsors.manage",
  EXHIBITORS_READ: "exhibitors.read",
  EXHIBITORS_MANAGE: "exhibitors.manage",
  REGISTRATIONS_READ: "registrations.read",
  REGISTRATIONS_CREATE: "registrations.create",
  REGISTRATIONS_UPDATE: "registrations.update",
  REGISTRATIONS_VERIFY: "registrations.verify",
  TICKET_CATEGORIES_MANAGE: "ticket_categories.manage",
  PAYMENTS_READ: "payments.read",
  PAYMENTS_CONFIRM_MANUAL: "payments.confirm_manual",
  FINANCE_REPORTS: "finance.reports",
  ATTENDANCE_CHECK_IN: "attendance.check_in",
  ENGAGEMENT_MANAGE: "engagement.manage",
  ADMIN_DASHBOARD: "admin.dashboard",
  SUBMISSIONS_READ: "submissions.read",
  SUBMISSIONS_MANAGE: "submissions.manage",
  REVIEWS_MANAGE: "reviews.manage",
} as const;

const PORTAL_PREFIXES = ["/dashboard", "/admin", "/desk", "/moderator", "/exhibitor", "/speaker"] as const;

const PORTAL_ROLE_ACCESS: Record<string, string[]> = {
  "/dashboard": ["attendee", "speaker", "exhibitor_contact", "exhibitor"],
  "/admin": [
    "super_admin",
    "finance_officer",
    "programme_committee",
    "program_admin",
    "content_manager",
    "exhibitor_manager",
    "reviewer",
  ],
  "/desk": ["registration_desk", "media_press", "media"],
  "/moderator": ["programme_committee", "program_admin", "content_manager"],
  "/exhibitor": ["exhibitor_contact", "exhibitor", "exhibitor_manager"],
  "/speaker": ["speaker"],
};

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[], required: string[]): boolean {
  return required.some((p) => permissions.includes(p));
}

export function hasAnyRole(roles: string[], required: string[]): boolean {
  return required.some((r) => roles.includes(r));
}

export function getDefaultPortalPath(roles: string[], permissions: string[]): string {
  if (roles.some(isAdminRole)) return "/admin";
  if (roles.includes("registration_desk") || roles.includes("media_press") || roles.includes("media")) {
    return "/desk";
  }
  if (roles.includes("speaker")) return "/speaker";
  if (roles.includes("exhibitor_contact") || roles.includes("exhibitor")) return "/exhibitor";
  if (
    roles.includes("programme_committee") ||
    roles.includes("program_admin") ||
    hasPermission(permissions, PERMISSIONS.ENGAGEMENT_MANAGE)
  ) {
    return "/moderator";
  }
  return "/dashboard";
}

export function canAccessPortal(
  pathname: string,
  roles: string[],
  permissions: string[] = [],
): boolean {
  if (!roles.length) return false;
  if (roles.some(isAdminRole)) return true;

  const prefix = PORTAL_PREFIXES.find((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!prefix) return true;

  const allowed = PORTAL_ROLE_ACCESS[prefix];
  if (!allowed) return true;

  if (prefix === "/moderator") {
    return hasAnyRole(roles, allowed) || hasPermission(permissions, PERMISSIONS.ENGAGEMENT_MANAGE);
  }

  return hasAnyRole(roles, allowed);
}

export function resolvePortalRole(roles: string[]): Role {
  return resolveLegacyRole(roles);
}

export function decodeJwtPayload<T extends Record<string, unknown>>(token: string): T | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function permissionsFromAccessToken(token: string): string[] {
  const payload = decodeJwtPayload<{ permissions?: string[] }>(token);
  return payload?.permissions ?? [];
}

export function rolesFromAccessToken(token: string): string[] {
  const payload = decodeJwtPayload<{ roles?: string[] }>(token);
  return payload?.roles ?? [];
}
