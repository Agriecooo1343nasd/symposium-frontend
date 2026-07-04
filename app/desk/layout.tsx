"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileCheck, Inbox, ScanLine, Radio, Mic, Store, Newspaper, Vote } from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth";

const NAV: readonly PortalNavItem[] = [
  { to: "/desk", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/desk/registrations", label: "Registrations", icon: Users },
  { to: "/desk/media", label: "Media / Press", icon: Newspaper },
  { to: "/desk/verifications", label: "Verifications", icon: FileCheck },
  { to: "/desk/applications", label: "Speaker apps", icon: Inbox },
  { to: "/desk/exhibitors", label: "Exhibitors", icon: Store },
  { to: "/desk/speakers", label: "Speakers", icon: Mic },
  { to: "/desk/checkin", label: "Check-in", icon: ScanLine },
  { to: "/desk/live", label: "Live stream", icon: Radio },
  { to: "/desk/polls", label: "Live polls", icon: Vote },
];

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready, roles, permissions, authStatus } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (authStatus === "idle" || authStatus === "loading") return;
    if (!session || !roles || roles.length === 0 || !canAccessPortal("/desk", roles, permissions)) {
      signOut();
      router.replace("/login");
    }
  }, [ready, authStatus, session, roles, permissions, router]);

  if (!ready || authStatus === "idle" || authStatus === "loading" || !session || !roles || roles.length === 0 || !canAccessPortal("/desk", roles, permissions)) {
    return null;
  }

  return (
    <PortalShell title="Registration Desk" subtitle="Desk Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
