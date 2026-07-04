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
  const { session, ready, roles, permissions } = useAuth();
  useStore();
  const nav = useMemo(() => {
    if (!session) return BASE_NAV;
    if (!getGroupByRepresentativeEmail(session.email)) return BASE_NAV;
    const delegation: PortalNavItem = { to: "/dashboard/group", label: "My delegation", icon: Users };
    return [BASE_NAV[0], delegation, ...BASE_NAV.slice(1)];
  }, [session?.email]);

  useEffect(() => {
    if (!ready) return;
    if (!session || !roles || roles.length === 0 || !canAccessPortal("/dashboard", roles, permissions)) {
      signOut();
      router.replace("/login");
    }
  }, [ready, session, roles, permissions, router]);

  if (!ready || !session || !roles || roles.length === 0 || !canAccessPortal("/dashboard", roles, permissions)) {
    return null;
  }

  return (
    <PortalShell title="Attendee Dashboard" subtitle="Attendee Portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
