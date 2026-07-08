"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyRegistrations } from "@/hooks/api/useRegistration";
import { hasSessionMaterialsAccess } from "@/lib/access";

/** Whether the signed-in user may view session slides/handouts on the programme. */
export function useSessionMaterialsAccess() {
  const { isAuthenticated, roles, ready } = useAuth();
  const { registrations, isLoading: registrationsLoading } = useMyRegistrations();

  const canView = useMemo(
    () => hasSessionMaterialsAccess({ roles, registrations }),
    [roles, registrations],
  );

  return {
    ready,
    canView,
    isAuthenticated,
    registrationsLoading: isAuthenticated && registrationsLoading,
    hasPaidRegistration: registrations.some((r) => r.isPaid || r.isActive),
  };
}
