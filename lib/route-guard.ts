import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { getAccessToken } from "./api/client";
import { canAccessPortal } from "./permissions";
import type { Role } from "./mock-data";

export function requirePortalAccess(portalPrefix: string) {
  return () => {
    if (typeof window === "undefined") return;
    const session = getSession();
    if (!getAccessToken() || !session || !canAccessPortal(portalPrefix, session.role)) {
      redirect("/login");
    }
  };
}

export function requireRoles(...roles: Role[]) {
  return () => {
    if (typeof window === "undefined") return;
    const session = getSession();
    if (!session || (!roles.includes(session.role) && session.role !== "admin")) {
      redirect("/login");
    }
  };
}
