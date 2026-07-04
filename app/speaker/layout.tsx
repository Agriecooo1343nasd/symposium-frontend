"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, BookOpen, Upload, User, Users, Radio, Vote } from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth";

const NAV: readonly PortalNavItem[] = [
  { to: "/speaker", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/speaker/sessions", label: "My sessions", icon: Calendar, exact: false },
  { to: "/speaker/abstracts", label: "Abstracts", icon: BookOpen, exact: false },
  { to: "/speaker/materials", label: "Presentation", icon: Upload, exact: false },
  { to: "/speaker/profile", label: "Profile", icon: User, exact: false },
  { to: "/speaker/networking", label: "Networking", icon: Users, exact: false },
  { to: "/speaker/live", label: "Live stream", icon: Radio, exact: false },
  { to: "/speaker/polls", label: "Live polls", icon: Vote, exact: false },
];

export default function SpeakerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready, roles, permissions, authStatus } = useAuth();
  const allowed = canAccessPortal("/speaker", roles, permissions);

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
    <PortalShell title="Speaker Console" subtitle="Speaker Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
