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
  const { session, ready, roles, permissions } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !roles || roles.length === 0 || !canAccessPortal("/speaker", roles, permissions)) {
      signOut();
      router.replace("/login");
    }
  }, [ready, session, roles, permissions, router]);

  if (!ready || !session || !roles || roles.length === 0 || !canAccessPortal("/speaker", roles, permissions)) {
    return null;
  }

  return (
    <PortalShell title="Speaker Console" subtitle="Speaker Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
