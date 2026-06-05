"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Run a page action from ?action=… then strip it from the URL. */
export function useAdminCommandAction(handlers: Record<string, () => void>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const action = searchParams.get("action");
    if (!action) return;
    const fn = handlersRef.current[action];
    if (!fn) return;

    const timer = window.setTimeout(() => {
      fn();
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [searchParams, pathname, router]);
}

const TAB_PAGES: Record<string, { valid: string[]; defaultTab: string }> = {
  "/admin/finance": { valid: ["overview", "transactions", "sponsorship", "bank", "reports", "settings"], defaultTab: "overview" },
  "/admin/registrations": { valid: ["individual", "groups"], defaultTab: "individual" },
  "/admin/refunds": { valid: ["cancellations", "waitlist", "plans"], defaultTab: "cancellations" },
  "/admin/media": { valid: ["pending", "approved", "rejected", "all"], defaultTab: "pending" },
  "/admin/checkin": { valid: ["scan", "dashboard"], defaultTab: "scan" },
  "/admin/desk": { valid: ["verifications", "speakers", "orgs", "registrations", "checkins"], defaultTab: "verifications" },
  "/admin/users": { valid: ["users", "invites", "roles", "audit"], defaultTab: "users" },
  "/admin/speakers": { valid: ["list", "submissions"], defaultTab: "list" },
  "/admin/programme": { valid: ["sessions", "timeline1", "timeline2", "rooms", "ratings"], defaultTab: "sessions" },
  "/admin/communications": { valid: ["email", "sms", "invites", "auto", "announce"], defaultTab: "email" },
};

/** Controlled tab state synced with ?tab= query param. */
export function useAdminTabParam(pathname: string, validTabs: string[], defaultTab: string) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initial = tabParam && validTabs.includes(tabParam) ? tabParam : defaultTab;

  useEffect(() => {
    // Tab param is read on mount; parent should use key={tabParam} or controlled state
  }, [tabParam]);

  return initial;
}

export function getTabFromUrl(pathname: string, searchParams: URLSearchParams): string | null {
  const cfg = TAB_PAGES[pathname];
  if (!cfg) return null;
  const tab = searchParams.get("tab");
  return tab && cfg.valid.includes(tab) ? tab : null;
}
