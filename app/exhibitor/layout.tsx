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
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/permissions";

const ALL_NAV: readonly (PortalNavItem & { showFor: ("exhibitor" | "sponsor" | "both")[] })[] = [
  { to: "/exhibitor", label: "Overview", icon: LayoutDashboard, exact: true, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/booth", label: "Booth profile", icon: Store, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/qr", label: "Booth QR", icon: QrCode, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/sponsorship", label: "Sponsorship", icon: Sparkles, showFor: ["sponsor", "both"] },
  { to: "/exhibitor/materials", label: "Brochures", icon: FileText, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/leads", label: "Leads", icon: Users, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/passes", label: "Staff passes", icon: IdCard, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/analytics", label: "Analytics", icon: BarChart3, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/location", label: "Booth info", icon: Map, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/networking", label: "Networking", icon: MessageSquare, showFor: ["exhibitor", "sponsor", "both"] },
  { to: "/exhibitor/live", label: "Live stream", icon: Radio, showFor: ["exhibitor", "sponsor", "both"] },
];

const PARTICIPATION_TITLE: Record<string, string> = {
  sponsor: "Sponsor Console",
  both: "Exhibitor + Sponsor Console",
  exhibitor: "Exhibitor Console",
};

const PARTICIPATION_SUBTITLE: Record<string, string> = {
  sponsor: "Sponsor Portal",
  both: "Exhibitor & Sponsor Portal",
  exhibitor: "Exhibitor Portal",
};

export default function ExhibitorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !canAccessPortal("/exhibitor", session.role)) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || !canAccessPortal("/exhibitor", session.role)) {
    return null;
  }

  const participation = (session.participation ?? "exhibitor") as "exhibitor" | "sponsor" | "both";
  const nav = ALL_NAV.filter((n) => n.showFor.includes(participation)) as PortalNavItem[];

  return (
    <PortalShell
      title={PARTICIPATION_TITLE[participation] ?? "Exhibitor Console"}
      subtitle={PARTICIPATION_SUBTITLE[participation] ?? "Exhibitor Portal"}
      nav={nav}
    >
      {children}
    </PortalShell>
  );
}
