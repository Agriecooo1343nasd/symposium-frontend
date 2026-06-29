"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { SpeakerSessionMaterialsPanel } from "@/components/speaker/SpeakerSessionMaterialsPanel";
import { useSpeakerDashboard, useSpeakerSession } from "@/hooks/api/useSpeaker";

function SessionCard({ sessionId, title, startTime, endTime }: { sessionId: string; title: string; startTime: string; endTime: string }) {
  const { data: session } = useSpeakerSession(sessionId);
  const s = new Date(startTime);
  const e = new Date(endTime);
  const timeLabel = `${s.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${s.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}–${e.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{timeLabel}</div>
          {session?.room && <div className="text-xs text-muted-foreground">{session.room}</div>}
          <div className="font-serif font-bold mt-1">{title}</div>
        </div>
        <Link href={`/programme/${sessionId}`} className="text-xs text-accent hover:underline">
          Public session page
        </Link>
      </div>
      <SpeakerSessionMaterialsPanel sessionId={sessionId} sessionTitle={title} />
    </div>
  );
}

export default function SpeakerSessionsPage() {
  const { dashboard, isLoading, isError } = useSpeakerDashboard();
  const sessions = dashboard?.upcomingSessions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">My sessions</h1>
        <p className="text-muted-foreground">
          Upload and manage presentation files per assigned session.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading sessions…
        </div>
      ) : isError || !dashboard ? (
        <p className="text-sm text-muted-foreground">Speaker profile not found.</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sessions assigned yet. The programme committee will link sessions after approval.
        </p>
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              sessionId={s.id}
              title={s.title}
              startTime={s.startTime}
              endTime={s.endTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
