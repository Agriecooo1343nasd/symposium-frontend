"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Users, FileText, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SessionCard } from "@/components/SessionCard";
import { StatTile } from "@/components/layout/PortalShell";
import { SESSIONS, DEMO_USER, NOTIFICATIONS } from "@/lib/mock-data";

export default function OverviewPage() {
  const [now] = useState(() => Date.now());
  const upcoming = SESSIONS.slice(0, 3);
  const next = SESSIONS[0];
  const recent = NOTIFICATIONS.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative flex flex-wrap gap-6 justify-between items-end">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold mb-1">Welcome back</div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">{DEMO_USER.name.split(" ")[0]} 👋</h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green/20 text-white px-3 py-1 text-xs font-semibold">
              {DEMO_USER.category} · Confirmed
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> 13-14 August 2026
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Kigali Marriott
              </span>
            </div>
          </div>
          <CountdownTimer light compact />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Sessions saved" value={6} hint="of 12 available" accent />
        <StatTile label="Connections" value={4} hint="2 pending" />
        <StatTile label="Materials" value={5} hint="all downloaded" />
        <StatTile
          label="Days to go"
          value={Math.max(0, Math.ceil((new Date("2026-08-13").getTime() - now) / 86400000))}
        />
      </div>

      <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6">
        <div>
          <div className="rounded-2xl bg-blue/5 border border-blue/20 p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-blue font-semibold">Your next session</div>
            <div className="font-serif text-lg font-bold mt-1">{next.title}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Day {next.day} - {next.start}-{next.end} - {next.room}
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <h2 className="font-serif text-xl font-bold">Recommended for you</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/schedule">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {upcoming.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
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
                <Link href="/dashboard/apply">Apply to speak or exhibit</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-serif font-bold mb-3">Recent updates</h3>
            <div className="space-y-3">
              {recent.map((n) => (
                <div key={n.id} className="text-sm">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.time}</div>
                </div>
              ))}
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
