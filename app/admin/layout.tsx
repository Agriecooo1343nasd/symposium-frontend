"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  BarChart3,
  Inbox,
  DollarSign,
  Calendar,
  Mic,
  Store,
  ScanLine,
  Megaphone,
  Shield,
  Settings,
  Ticket,
  ClipboardList,
  Award,
  ClipboardCheck,
  UserCircle,
  Newspaper,
  RotateCcw,
  MessageCircle,
  Camera,
  Vote,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";
import { AdminCommandPaletteProvider } from "@/components/admin/AdminCommandPaletteProvider";
import { useAuth } from "@/hooks/use-auth";
import { canAccessPortal } from "@/lib/permissions";

const NAV: readonly PortalNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/registrations", label: "Registrations", icon: Users },
  { to: "/admin/media", label: "Media / Press", icon: Camera },
  { to: "/admin/refunds", label: "Refunds & waitlist", icon: RotateCcw },
  { to: "/admin/ticket-plans", label: "Pass plans", icon: Ticket },
  { to: "/admin/finance", label: "Finance", icon: DollarSign },
  { to: "/admin/programme", label: "Programme", icon: Calendar },
  { to: "/admin/speakers", label: "Speakers", icon: Mic },
  { to: "/admin/abstracts", label: "Speaker apps", icon: BookOpen },
  { to: "/admin/exhibitors", label: "Exhibitors", icon: Store },
  { to: "/admin/certificate", label: "Certificate", icon: Award },
  { to: "/admin/surveys", label: "Surveys", icon: ClipboardCheck },
  { to: "/admin/committee", label: "Committee", icon: UserCircle },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/networking", label: "Networking", icon: MessageCircle },
  { to: "/admin/polls", label: "Live polls", icon: Vote },
  { to: "/admin/checkin", label: "Check-in", icon: ScanLine },
  { to: "/admin/communications", label: "Communications", icon: Megaphone },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/users", label: "Users & Roles", icon: Shield },
  { to: "/admin/desk", label: "Desk audit", icon: ClipboardList },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!session || !canAccessPortal("/admin", session.role)) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || !canAccessPortal("/admin", session.role)) {
    return null;
  }

  return (
    <AdminCommandPaletteProvider>
      <PortalShell title="Admin Console" subtitle="Organizer Portal" nav={NAV}>
        {children}
      </PortalShell>
    </AdminCommandPaletteProvider>
  );
}
