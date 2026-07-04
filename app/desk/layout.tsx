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
  const allowed = canAccessPortal("/desk", roles, permissions);

  useEffect(() => {
    if (!ready) return;
    if (authStatus === "idle" || authStatus === "loading") return;
    if (!session || !roles || roles.length === 0 || !allowed) {
      signOut();
      router.replace("/login");
    }
  }, [ready, authStatus, session, roles, permissions, allowed, router]);

  if (!ready || authStatus === "idle" || authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !roles || roles.length === 0 || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="max-w-2xl w-full border rounded-md p-6 shadow">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="mt-2 text-sm">You do not have permission to access this portal.</p>
        </div>
      </div>
    );
  }

  return (
    <PortalShell title="Registration Desk" subtitle="Desk Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
