"use client";

import { getSession } from "@/lib/auth";
import { LiveStreamRoom } from "@/components/live/LiveStreamRoom";

export default function ModeratorLivePage() {
  const session = getSession();
  return (
    <LiveStreamRoom
      authorName={session?.name ?? "Moderator"}
      authorEmail={session?.email}
      location="in-person"
      title="Live symposium"
      subtitle="Monitor the stream and audience feed alongside Zoom controls."
    />
  );
}
