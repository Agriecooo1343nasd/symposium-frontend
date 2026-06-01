"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { getSessions } from "@/lib/sessions";
import { SPEAKERS } from "@/lib/mock-data";
import { SessionMaterialsPanel } from "@/components/session/SessionMaterialsPanel";

export default function SpeakerSessionsPage() {
  const { session } = useAuth();
  useStore();
  const speaker = SPEAKERS.find((s) => s.name === session?.name) ?? SPEAKERS[0];
  const mine = getSessions().filter((s) => s.speakers.includes(speaker.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">My sessions</h1>
        <p className="text-muted-foreground">
          Manage session files here (FR-4.3) — add, update, or remove materials per session. Paid attendees see them in the app, not on the public programme.
        </p>
      </div>
      <div className="space-y-6">
        {mine.map((s) => (
          <div key={s.id} className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Day {s.day} · {s.start}–{s.end} · {s.room}</div>
                <div className="font-serif font-bold mt-1">{s.title}</div>
              </div>
              <Link href={`/programme/${s.id}`} className="text-xs text-accent hover:underline">
                Public session page
              </Link>
            </div>
            <SessionMaterialsPanel
              sessionId={s.id}
              sessionTitle={s.title}
              allowUpload
              uploaderName={session?.name}
              uploaderEmail={session?.email}
            />
          </div>
        ))}
        {mine.length === 0 && (
          <p className="text-sm text-muted-foreground">No sessions assigned yet. Programme committee will link your sessions after approval.</p>
        )}
      </div>
    </div>
  );
}
