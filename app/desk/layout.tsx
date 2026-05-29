"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileCheck, Inbox, ScanLine, Radio } from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/permissions";

const NAV: readonly PortalNavItem[] = [
  { to: "/desk", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/desk/registrations", label: "Registrations", icon: Users },
  { to: "/desk/verifications", label: "Verifications", icon: FileCheck },
  { to: "/desk/applications", label: "Applications", icon: Inbox },
  { to: "/desk/checkin", label: "Check-in", icon: ScanLine },
  { to: "/desk/live", label: "Live stream", icon: Radio },
];

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !canAccessPortal("/desk", session.role)) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || !canAccessPortal("/desk", session.role)) {
    return null;
  }

  return (
    <PortalShell title="Registration Desk" subtitle="Desk Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
