import { useEffect, useState } from "react";
import { getSession, subscribeAuth } from "@/lib/auth";
import type { MockSession } from "@/lib/mock-data";
import { useAppSelector } from "@/store/hooks";

export function useAuth() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [ready, setReady] = useState(false);
  const auth = useAppSelector((s) => s.auth);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    return subscribeAuth(() => setSession(getSession()));
  }, []);

  return {
    session,
    ready,
    user: auth.user,
    roles: auth.user?.roles ?? [],
    permissions: auth.user?.permissions ?? [],
    isAuthenticated: auth.status === "authenticated" || Boolean(session),
  };
}
