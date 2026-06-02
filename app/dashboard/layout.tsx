"use client";

import { useEffect } from "react";
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
  Store,
  Radio,
  RotateCcw,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/permissions";

const NAV: readonly PortalNavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/live", label: "Live session", icon: Radio, exact: false },
  { to: "/dashboard/ticket", label: "My Ticket", icon: Ticket, exact: false },
  { to: "/dashboard/refunds", label: "Refunds & transfer", icon: RotateCcw, exact: false },
  { to: "/dashboard/schedule", label: "My Schedule", icon: Calendar, exact: false },
  { to: "/dashboard/apply", label: "Apply to speak", icon: Mic, exact: false },
  { to: "/dashboard/apply-exhibit", label: "Apply to exhibit", icon: Store, exact: false },
  { to: "/dashboard/networking", label: "Networking", icon: Users, exact: false },
  { to: "/dashboard/materials", label: "Materials", icon: FileText, exact: false },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell, exact: false },
  { to: "/dashboard/certificate", label: "Certificate", icon: Award, exact: false },
  { to: "/dashboard/survey", label: "Survey", icon: ClipboardCheck, exact: false },
  { to: "/dashboard/profile", label: "Profile", icon: User, exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !canAccessPortal("/dashboard", session.role)) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || !canAccessPortal("/dashboard", session.role)) {
    return null;
  }

  return (
    <PortalShell title="Attendee Dashboard" subtitle="Attendee Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
