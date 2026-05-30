"use client";

import { Clock, MapPin, Users, Target, BookOpen, Lock } from "lucide-react";
import { SubThemeBadge } from "@/components/SubThemeBadge";
import { SPEAKERS, type Session } from "@/lib/mock-data";
import { sessionVisibility } from "@/lib/access";
import { cn } from "@/lib/utils";

type Props = {
  session: Session;
  productionNotes?: string;
  className?: string;
};

export function SessionDetailPreview({ session, productionNotes, className }: Props) {
  const speakers = session.speakers
    .map((id) => SPEAKERS.find((s) => s.id === id))
    .filter((s): s is (typeof SPEAKERS)[number] => Boolean(s));
  const vis = sessionVisibility(session);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-lg gradient-navy text-white p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {session.type}
          </span>
          <SubThemeBadge theme={session.subTheme} />
          <span className="rounded-full bg-gold/20 text-gold px-2.5 py-0.5 text-[10px] font-semibold">
            Day {session.day}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
              vis === "public" ? "bg-green/30 text-green-100" : "bg-amber-500/30 text-amber-100",
            )}
          >
            {vis === "public" ? "Public programme" : "Subscribers only"}
          </span>
        </div>
        <h2 className="font-serif text-xl font-bold">{session.title}</h2>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/85">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gold" /> {session.start} – {session.end}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gold" /> {session.room}
          </span>
          {session.capacity != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-gold" /> Capacity {session.capacity}
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-serif font-bold text-sm mb-2">About this session</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{session.longDescription ?? session.description}</p>
      </div>

      {session.learningObjectives && session.learningObjectives.length > 0 && (
        <div>
          <h3 className="font-serif text-sm font-bold mb-2 inline-flex items-center gap-1.5">
            <Target className="h-4 w-4 text-accent" /> What you&apos;ll take away
          </h3>
          <ul className="space-y-1.5 text-sm">
            {session.learningObjectives.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="text-accent">•</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {session.prerequisites && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1 inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Good to know
          </div>
          {session.prerequisites}
        </div>
      )}

      {speakers.length > 0 && (
        <div>
          <h3 className="font-serif text-sm font-bold mb-2">Speakers</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {speakers.map((s) => (
              <div key={s.id} className="flex gap-2 rounded-lg border p-2 text-sm">
                <img src={s.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {productionNotes && (
        <div className="rounded-lg bg-secondary/50 border p-3 text-sm">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Production / run-of-show notes</div>
          {productionNotes}
        </div>
      )}

      {vis === "subscribers" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Not shown on the public programme — paid delegates and staff only.
        </p>
      )}
    </div>
  );
}
