"use client";

import { LiveStreamRoom } from "@/components/live/LiveStreamRoom";
import { useAuth } from "@/hooks/use-auth";

export default function SpeakerLivePage() {
  const { session } = useAuth();
  return (
    <LiveStreamRoom
      authorName={session?.name ?? "Speaker"}
      authorEmail={session?.email}
      location="in-person"
      title="Live session"
      subtitle="Join the symposium stream from the speaker portal."
    />
  );
}
