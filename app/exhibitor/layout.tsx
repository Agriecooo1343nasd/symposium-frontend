"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  MessageSquare,
  FileText,
  IdCard,
  BarChart3,
  Map,
  Sparkles,
  QrCode,
  Radio,
  Vote,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth";

const NAV: readonly PortalNavItem[] = [
  { to: "/exhibitor", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/exhibitor/booth", label: "Booth profile", icon: Store },
  { to: "/exhibitor/qr", label: "Booth QR", icon: QrCode },
  { to: "/exhibitor/sponsorship", label: "Sponsorship", icon: Sparkles },
  { to: "/exhibitor/materials", label: "Brochures", icon: FileText },
  { to: "/exhibitor/leads", label: "Leads", icon: Users },
  { to: "/exhibitor/passes", label: "Staff passes", icon: IdCard },
  { to: "/exhibitor/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/exhibitor/location", label: "Booth info", icon: Map },
  { to: "/exhibitor/networking", label: "Networking", icon: MessageSquare },
  { to: "/exhibitor/live", label: "Live stream", icon: Radio },
  { to: "/exhibitor/polls", label: "Live polls", icon: Vote },
];

export default function ExhibitorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready, roles, permissions } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !roles || roles.length === 0 || !canAccessPortal("/exhibitor", roles, permissions)) {
      signOut();
      router.replace("/login");
    }
  }, [ready, session, roles, permissions, router]);

  if (!ready || !session || !roles || roles.length === 0 || !canAccessPortal("/exhibitor", roles, permissions)) {
    return null;
  }

  return (
    <PortalShell title="Exhibitor Console" subtitle="Exhibitor Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}
