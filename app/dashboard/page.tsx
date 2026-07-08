"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Users, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SessionCard } from "@/components/SessionCard";
import { StatTile } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import { useMyRegistrations } from "@/hooks/api/useRegistration";
import { useMyNotifications, useMySchedule } from "@/hooks/api/useDashboard";
import {
  primaryRegistration,
  registrationCategoryLabel,
  registrationStatusLabel,
} from "@/lib/api/mappers/registration-helpers";
import { userDisplayName } from "@/lib/api/mappers/user";
import { MyOrganizationApplicationsCard } from "@/components/dashboard/MyOrganizationApplicationsCard";
import { useCurrentUser } from "@/hooks/api/useAuthSession";

export default function OverviewPage() {
  const { session } = useAuth();
  const { data: user } = useCurrentUser();
  const { symposium } = useSymposium();
  const { registrations } = useMyRegistrations();
  const reg = primaryRegistration(registrations);
  const { notifications, unreadCount } = useMyNotifications({ limit: 5 });
  const { sessions, isLoading: scheduleLoading } = useMySchedule();

  const displayName = user ? userDisplayName(user) : session?.name ?? "Delegate";
  const category = registrationCategoryLabel(reg);
  const statusLabel = reg ? registrationStatusLabel(reg.status) : "Not registered";
  const recent = notifications.slice(0, 3);
  const upcoming = sessions.slice(0, 3);
  const next = sessions[0];
  const countdownTarget = symposium?.countdownTarget ?? symposium?.startDate ?? null;
  const daysToGo = symposium?.startDate
    ? Math.max(0, Math.ceil((new Date(symposium.startDate).getTime() - Date.now()) / 86400000))
    : Math.max(0, Math.ceil((new Date("2026-08-13").getTime() - Date.now()) / 86400000));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative flex flex-wrap gap-6 justify-between items-end">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold mb-1">Welcome back</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green/20 text-white px-3 py-1 text-xs font-semibold">
              {category} · {statusLabel}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> 13-14 August 2026
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {symposium?.venue ?? "Kigali Marriott"}
              </span>
            </div>
          </div>
          <CountdownTimer target={countdownTarget} light compact />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Sessions saved" value={scheduleLoading ? "…" : sessions.length} hint="in your agenda" accent />
        <StatTile label="Notifications" value={unreadCount} hint="unread" />
        <StatTile label="Registration" value={reg ? "✓" : "—"} hint={statusLabel} />
        <StatTile label="Days to go" value={daysToGo} />
      </div>

      <MyOrganizationApplicationsCard />

      <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6">
        <div>
          {next ? (
            <div className="rounded-2xl bg-blue/5 border border-blue/20 p-5 mb-4">
              <div className="text-xs uppercase tracking-wider text-blue font-semibold">Your next session</div>
              <div className="font-serif text-lg font-bold mt-1">{next.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Day {next.day} · {next.start}–{next.end} · {next.room}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-secondary/40 border border-dashed border-border p-5 mb-4 text-sm text-muted-foreground">
              No sessions in your agenda yet. Browse the{" "}
              <Link href="/programme" className="text-accent font-semibold hover:underline">
                programme
              </Link>{" "}
              and save sessions to build your schedule.
            </div>
          )}

          <div className="flex justify-between items-center mb-3">
            <h2 className="font-serif text-xl font-bold">Your agenda</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/schedule">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          {scheduleLoading ? (
            <div className="text-muted-foreground text-sm py-8">Loading schedule…</div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Save sessions from the programme to see them here.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-serif font-bold mb-3">Quick actions</h3>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/dashboard/ticket">
                  <Download className="h-3.5 w-3.5 mr-2" /> View e-ticket
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/dashboard/networking">
                  <Users className="h-3.5 w-3.5 mr-2" /> Browse attendees
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/dashboard/materials">
                  <FileText className="h-3.5 w-3.5 mr-2" /> Materials
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gradient-blue text-accent-foreground" size="sm">
                <Link href="/dashboard/apply">Apply to speak</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-serif font-bold mb-3">Recent updates</h3>
            <div className="space-y-3">
              {recent.length > 0 ? (
                recent.map((n) => (
                  <div key={n.id} className="text-sm">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.time}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              )}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full mt-3">
              <Link href="/dashboard/notifications">All notifications</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
