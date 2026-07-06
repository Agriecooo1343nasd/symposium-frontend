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
import { canAccessPortal } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth";

const NAV: readonly PortalNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/registrations", label: "Registrations", icon: Users },
  { to: "/admin/media", label: "Media / Press", icon: Camera },
  { to: "/admin/refunds", label: "Refunds & waitlist", icon: RotateCcw },
  { to: "/admin/ticket-plans", label: "Registration fees", icon: Ticket },
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
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready, roles, permissions, authStatus } = useAuth();
  const allowed = canAccessPortal("/admin", roles, permissions);

  useEffect(() => {
    if (!ready) return;
    // wait for auth hydration to complete
    if (authStatus === "idle" || authStatus === "loading") return;
    // If backend-authenticated roles are missing or access denied, clear local session and redirect to login
    if (!session || !roles || roles.length === 0 || !allowed) {
      signOut();
      router.replace("/login");
    }
  }, [ready, authStatus, session, roles, permissions, allowed, router]);

  // Show loading during hydration
  if (!ready || authStatus === "idle" || authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if roles missing or access denied
  if (!session || !roles || roles.length === 0 || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white text-sm text-muted-foreground">
        <div className="max-w-2xl w-full border rounded-md p-6 shadow">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="mt-2 text-sm">You do not have permission to access the admin portal.</p>
          <div className="mt-4 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-green-600 text-white"
              onClick={() => router.replace("/login")}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminCommandPaletteProvider>
      <PortalShell title="Admin Console" subtitle="Organizer Portal" nav={NAV}>
        {children}
      </PortalShell>
    </AdminCommandPaletteProvider>
  );
}
