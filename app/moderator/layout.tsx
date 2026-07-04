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
  Vote,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth";

const NAV: readonly PortalNavItem[] = [
  { to: "/moderator", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/moderator/run-of-show", label: "Run of show", icon: ListOrdered },
  { to: "/moderator/zoom", label: "Zoom & live", icon: Video },
  { to: "/moderator/live", label: "Live stream", icon: Radio },
  { to: "/moderator/queue", label: "Remote queue", icon: MessageSquare },
  { to: "/moderator/polls", label: "Live polls", icon: Vote },
  { to: "/moderator/av-requirements", label: "AV & venue prep", icon: Settings2 },
  { to: "/moderator/recordings", label: "Recordings", icon: Upload },
  { to: "/moderator/surveys", label: "Surveys", icon: ClipboardCheck },
  { to: "/moderator/news", label: "News", icon: Newspaper },
  { to: "/moderator/booths", label: "Booth map", icon: Map },
  { to: "/moderator/networking", label: "Networking", icon: Users },
];

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready, roles, permissions, authStatus } = useAuth();
  const allowed = canAccessPortal("/moderator", roles, permissions);

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
    <PortalShell title="Moderator Console" subtitle="Live Event" nav={NAV}>
      {children}
    </PortalShell>
  );
}
