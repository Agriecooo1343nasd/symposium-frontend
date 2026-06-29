"use client";

import { useAuthHydration } from "@/hooks/api/useAuthSession";

export function AuthHydrator() {
  useAuthHydration();
  return null;
}
