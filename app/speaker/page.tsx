"use client";

import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/use-auth";
import { useSpeakerDashboard } from "@/hooks/api/useSpeaker";
import { useMySubmissions } from "@/hooks/api/useDashboard";

function formatSessionTime(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${s.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${s.toLocaleTimeString("en-GB", opts)}–${e.toLocaleTimeString("en-GB", opts)}`;
}

export default function SpeakerOverviewPage() {
  const { session } = useAuth();
  const { dashboard, isLoading, isError } = useSpeakerDashboard();
  const { data: submissions = [] } = useMySubmissions();

  const accepted = submissions.filter((s) => s.status === "accepted").length;
  const upcoming = dashboard?.upcomingSessions ?? [];
  const checklist = [
    { label: "Abstract submitted", done: (dashboard?.submissionsCount ?? submissions.length) > 0 },
    { label: "Presentation uploaded", done: (dashboard?.materialsCount ?? 0) > 0 },
    { label: "Sessions scheduled", done: (dashboard?.sessionsCount ?? 0) > 0 },
  ];
  const done = checklist.filter((c) => c.done).length;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading speaker dashboard…
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm">
        <p className="font-semibold text-amber-950">Speaker profile not found</p>
        <p className="mt-2 text-amber-900">
          Your account may not be linked to a speaker record yet. Apply via{" "}
          <Link href="/dashboard/apply" className="text-accent font-medium underline">
            Dashboard → Apply
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-gold flex items-center justify-center font-serif text-2xl">
            {dashboard.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-gold mb-1">Speaker</div>
            <h1 className="font-serif text-3xl font-bold">{dashboard.name}</h1>
            {session?.name && session.name !== dashboard.name && (
              <p className="text-sm text-white/80">{session.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Sessions" value={dashboard.sessionsCount} accent />
        <StatTile label="Submissions" value={dashboard.submissionsCount} />
        <StatTile label="Materials" value={dashboard.materialsCount} />
        <StatTile label="Accepted" value={accepted} hint="abstracts" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl font-bold">Your upcoming sessions</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/speaker/sessions">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sessions assigned yet.</p>
            ) : (
              upcoming.map((s) => (
                <Link key={s.id} href={`/programme/${s.id}`} className="block rounded-2xl bg-card border border-border p-5 hover-lift">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatSessionTime(s.startTime, s.endTime)}
                    </span>
                  </div>
                  <div className="font-serif font-bold">{s.title}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 h-fit">
          <h3 className="font-serif font-bold mb-1">Pre-event checklist</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {done} of {checklist.length} complete
          </p>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.label}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="w-full mt-4 gradient-blue text-accent-foreground" size="sm">
            <Link href="/speaker/materials">Upload presentation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
