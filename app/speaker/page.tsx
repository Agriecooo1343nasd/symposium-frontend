"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Clock, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/layout/PortalShell";
import { SESSIONS, SPEAKERS, SPEAKER_CHECKLIST } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

export default function SpeakerOverviewPage() {
  const { session } = useAuth();
  const me = SPEAKERS.find((s) => s.name === session?.name) ?? SPEAKERS[0];
  const mySessions = SESSIONS.filter((s) => s.speakers.includes(me.id));
  const done = SPEAKER_CHECKLIST.filter((x) => x.done).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative flex items-center gap-4">
          <img src={me.photo} alt={me.name} className="h-16 w-16 rounded-full object-cover border-2 border-gold" />
          <div>
            <div className="text-xs uppercase tracking-widest text-gold mb-1">Speaker</div>
            <h1 className="font-serif text-3xl font-bold">{me.name}</h1>
            <p className="text-sm text-white/80">{me.title} · {me.org}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Sessions" value={mySessions.length} accent />
        <StatTile label="Accepted abstracts" value={1} />
        <StatTile label="Pre-event tasks" value={`${done}/${SPEAKER_CHECKLIST.length}`} hint="checklist" />
        <StatTile label="Expected audience" value={mySessions.reduce((a, s) => a + (s.capacity ?? 0), 0)} />
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
            {mySessions.map((s) => (
              <Link key={s.id} href={`/programme/${s.id}`} className="block rounded-2xl bg-card border border-border p-5 hover-lift">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue/15 text-blue">{s.type}</span>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Day {s.day} · {s.start}–{s.end}
                  </span>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.room}
                  </span>
                </div>
                <div className="font-serif font-bold">{s.title}</div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 h-fit">
          <h3 className="font-serif font-bold mb-1">Pre-event checklist</h3>
          <p className="text-xs text-muted-foreground mb-4">{done} of {SPEAKER_CHECKLIST.length} complete</p>
          <ul className="space-y-2">
            {SPEAKER_CHECKLIST.map((item) => (
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
