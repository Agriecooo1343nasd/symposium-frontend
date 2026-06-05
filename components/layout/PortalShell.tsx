"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { Leaf, LogOut, Menu, X, Bell, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession, signOut } from "@/lib/auth";
import type { MockSession } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { AnnouncementBanner } from "@/components/admin/AnnouncementBanner";
import { useAdminCommandPaletteOptional } from "@/components/admin/AdminCommandPaletteProvider";
import { PortalNotesWidget } from "@/components/notes/PortalNotesWidget";

export type PortalNavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function PortalShell({ title, subtitle, nav, children }: { title: string; subtitle: string; nav: readonly PortalNavItem[]; children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<MockSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setSession(getSession()); }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const handleLogout = () => { signOut(); router.push("/login"); };
  const initials = session?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("") ?? "";

  const crumbs = pathname.split("/").filter(Boolean);
  const activeItem = [...nav].reverse().find((n) => n.exact ? pathname === n.to : pathname.startsWith(n.to));
  const commandPalette = useAdminCommandPaletteOptional();

  return (
    <PortalNotesWidget>
    <div className="min-h-screen bg-secondary/40">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 gradient-navy text-white flex flex-col transition-transform lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center"><Leaf className="h-4 w-4" /></div>
            <div><div className="font-serif font-bold">NAS 2026</div><div className="text-[10px] opacity-70">{subtitle}</div></div>
          </Link>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} href={n.to} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}>
              {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 p-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-gold text-navy flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="text-xs min-w-0">
              <div className="font-semibold truncate">{session?.name}</div>
              <div className="opacity-70 truncate">{session?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}

      <div className="flex min-h-screen flex-1 flex-col min-w-0 lg:ml-64">
        <header className="bg-card border-b border-border h-16 flex items-center gap-3 px-4 lg:px-8 sticky top-0 z-20">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <span className="font-semibold text-foreground">{title}</span>
            {crumbs.slice(1).map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 truncate">
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
                <span className={cn(i === crumbs.length - 2 && "text-foreground font-medium")}>{c.replace(/-/g, " ")}</span>
              </span>
            ))}
            {crumbs.length === 1 && activeItem && (
              <span className="inline-flex items-center gap-1.5"><ChevronRight className="h-3 w-3" /><span>{activeItem.label}</span></span>
            )}
          </div>
          {commandPalette ? (
            <button
              type="button"
              onClick={() => commandPalette.setOpen(true)}
              className="flex items-center gap-2 ml-auto lg:ml-0 lg:w-72 h-9 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors min-w-0"
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline truncate flex-1 text-left">Search menus & actions…</span>
              <kbd className="hidden lg:inline shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">Ctrl+K</kbd>
            </button>
          ) : (
            <div className="hidden lg:flex relative ml-auto w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-8 h-9 text-sm" readOnly />
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto lg:ml-2 shrink-0">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <div className="h-8 w-8 rounded-full gradient-navy text-white flex items-center justify-center text-xs font-serif font-bold">{initials}</div>
              <div className="text-xs hidden md:block">
                <div className="font-semibold leading-tight">{session?.name}</div>
                <div className="text-muted-foreground text-[10px]">{subtitle}</div>
              </div>
            </div>
          </div>
        </header>
        <AnnouncementBanner />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
    </PortalNotesWidget>
  );
}

export function StatTile({ label, value, hint, accent, trend }: { label: string; value: string | number; hint?: string; accent?: boolean; trend?: string }) {
  const positive = trend?.startsWith("+");
  return (
    <div className={cn("rounded-2xl p-5 border", accent ? "gradient-blue text-accent-foreground border-transparent" : "bg-card border-border")}>
      <div className={cn("text-xs uppercase tracking-wider font-semibold flex items-center justify-between", accent ? "text-white/80" : "text-muted-foreground")}>
        <span>{label}</span>
        {trend && (
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
            accent ? "bg-white/20 text-white" : positive ? "bg-green/15 text-green" : "bg-red-100 text-red-700"
          )}>{trend}</span>
        )}
      </div>
      <div className="font-serif text-3xl font-bold mt-2">{value}</div>
      {hint && <div className={cn("text-xs mt-1", accent ? "text-white/70" : "text-muted-foreground")}>{hint}</div>}
    </div>
  );
}
