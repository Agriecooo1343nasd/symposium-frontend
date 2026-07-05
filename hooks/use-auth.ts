import { useEffect, useMemo, useState } from "react";
import { getSession, subscribeAuth } from "@/lib/auth";
import type { MockSession } from "@/lib/mock-data";
import { getAccessToken } from "@/lib/api/client";
import { normalizeBackendRoles } from "@/lib/api/mappers/role";
import { rolesFromAccessToken } from "@/lib/auth/roles";
import { useAppSelector } from "@/store/hooks";

function resolveRoles(
  userRoles: string[] | undefined,
  session: MockSession | null,
): string[] {
  if (userRoles?.length) return normalizeBackendRoles(userRoles);

  const token = typeof window !== "undefined" ? getAccessToken() : null;
  if (token) {
    const fromToken = rolesFromAccessToken(token);
    if (fromToken.length) return normalizeBackendRoles(fromToken);
  }

  if (session?.role) return [session.role];
  return [];
}

export function useAuth() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const auth = useAppSelector((s) => s.auth);

  useEffect(() => {
    setSession(getSession());
    setSessionReady(true);
    return subscribeAuth(() => setSession(getSession()));
  }, []);

  const roles = useMemo(
    () => resolveRoles(auth.user?.roles, session),
    [auth.user?.roles, session],
  );

  const authReady = auth.status !== "idle" && auth.status !== "loading";
  const ready = sessionReady && authReady;

  return {
    session,
    ready,
    user: auth.user,
    roles,
    permissions: auth.user?.permissions ?? [],
    authStatus: auth.status,
    isAuthenticated: auth.status === "authenticated" || Boolean(session && getAccessToken()),
  };
}
