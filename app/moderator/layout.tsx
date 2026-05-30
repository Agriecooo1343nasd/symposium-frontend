"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  Video,
  MessageSquare,
  Upload,
  Radio,
  Settings2,
  ClipboardCheck,
  Newspaper,
  Map,
  Users,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/permissions";

const NAV: readonly PortalNavItem[] = [
  { to: "/moderator", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/moderator/run-of-show", label: "Run of show", icon: ListOrdered },
  { to: "/moderator/zoom", label: "Zoom & live", icon: Video },
  { to: "/moderator/live", label: "Live stream", icon: Radio },
  { to: "/moderator/queue", label: "Remote queue", icon: MessageSquare },
  { to: "/moderator/av-requirements", label: "AV & venue prep", icon: Settings2 },
  { to: "/moderator/recordings", label: "Recordings", icon: Upload },
  { to: "/moderator/surveys", label: "Surveys", icon: ClipboardCheck },
  { to: "/moderator/news", label: "News", icon: Newspaper },
  { to: "/moderator/booths", label: "Booth map", icon: Map },
  { to: "/moderator/networking", label: "Networking", icon: Users },
];

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !canAccessPortal("/moderator", session.role)) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || !canAccessPortal("/moderator", session.role)) {
    return null;
  }

  return (
    <PortalShell title="Moderator Console" subtitle="Live Event" nav={NAV}>
      {children}
    </PortalShell>
  );
}
