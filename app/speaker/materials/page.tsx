"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { SpeakerSessionMaterialsPanel } from "@/components/speaker/SpeakerSessionMaterialsPanel";
import { useSpeakerDashboard } from "@/hooks/api/useSpeaker";

export default function SpeakerMaterialsPage() {
  const { dashboard, isLoading, isError } = useSpeakerDashboard();
  const sessions = dashboard?.upcomingSessions ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <p className="text-sm text-muted-foreground">
        Speaker profile not found.{" "}
        <Link href="/dashboard/apply" className="text-accent underline">
          Apply as speaker
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Presentation materials</h1>
        <p className="text-muted-foreground mt-1">
          Upload decks per session and set AV requirements. Files are shared with moderators and the venue team.
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sessions assigned yet. Materials can be uploaded once sessions are linked to your speaker profile.
        </p>
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => (
            <SpeakerSessionMaterialsPanel
              key={s.id}
              sessionId={s.id}
              sessionTitle={s.title}
              showEquipment
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Manage all session uploads under{" "}
        <Link href="/speaker/sessions" className="text-accent underline">
          My sessions
        </Link>
        .
      </p>
    </div>
  );
}
