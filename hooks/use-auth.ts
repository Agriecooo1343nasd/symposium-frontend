import { useEffect, useState } from "react";
import { getSession, subscribeAuth } from "@/lib/auth";
import type { MockSession } from "@/lib/mock-data";

export function useAuth() {
  const [session, setSession] = useState<MockSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    return subscribeAuth(() => setSession(getSession()));
  }, []);

  return { session, ready };
}
