"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  User,
  Users,
  FileText,
  Award,
  Bell,
  ClipboardCheck,
  Mic,
  Radio,
  RotateCcw,
  Vote,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth";
import { useStore } from "@/hooks/use-store";
import { getGroupByRepresentativeEmail } from "@/lib/group-registration";

const BASE_NAV: readonly PortalNavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/live", label: "Live session", icon: Radio, exact: false },
  { to: "/dashboard/polls", label: "Live polls", icon: Vote, exact: false },
  { to: "/dashboard/ticket", label: "My Ticket", icon: Ticket, exact: false },
  { to: "/dashboard/refunds", label: "Refunds & transfer", icon: RotateCcw, exact: false },
  { to: "/dashboard/schedule", label: "My Schedule", icon: Calendar, exact: false },
  { to: "/dashboard/apply", label: "Apply to speak", icon: Mic, exact: false },
  { to: "/dashboard/networking", label: "Networking", icon: Users, exact: false },
  { to: "/dashboard/materials", label: "Materials", icon: FileText, exact: false },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell, exact: false },
  { to: "/dashboard/certificate", label: "Certificate", icon: Award, exact: false },
  { to: "/dashboard/survey", label: "Survey", icon: ClipboardCheck, exact: false },
  { to: "/dashboard/profile", label: "Profile", icon: User, exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready, roles, permissions, authStatus } = useAuth();
  useStore();
  const allowed = canAccessPortal("/dashboard", roles, permissions);

  const nav = useMemo(() => {
    if (!session) return BASE_NAV;
    if (!getGroupByRepresentativeEmail(session.email)) return BASE_NAV;
    const delegation: PortalNavItem = { to: "/dashboard/group", label: "My delegation", icon: Users };
    return [BASE_NAV[0], delegation, ...BASE_NAV.slice(1)];
  }, [session?.email]);

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
    <PortalShell title="Attendee Dashboard" subtitle="Attendee Portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
