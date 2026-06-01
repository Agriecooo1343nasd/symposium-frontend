"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, BookOpen, Upload, User, Users, Radio } from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/permissions";

const NAV: readonly PortalNavItem[] = [
  { to: "/speaker", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/speaker/sessions", label: "My sessions", icon: Calendar, exact: false },
  { to: "/speaker/abstracts", label: "Abstracts", icon: BookOpen, exact: false },
  { to: "/speaker/materials", label: "Presentation", icon: Upload, exact: false },
  { to: "/speaker/profile", label: "Profile", icon: User, exact: false },
  { to: "/speaker/networking", label: "Networking", icon: Users, exact: false },
  { to: "/speaker/live", label: "Live stream", icon: Radio, exact: false },
];

export default function SpeakerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !canAccessPortal("/speaker", session.role)) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || !canAccessPortal("/speaker", session.role)) {
    return null;
  }

  return (
    <PortalShell title="Speaker Console" subtitle="Speaker Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
