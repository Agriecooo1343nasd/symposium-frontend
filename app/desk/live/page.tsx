"use client";

import { getSession } from "@/lib/auth";
import { LiveStreamRoom } from "@/components/live/LiveStreamRoom";

export default function DeskLivePage() {
  const session = getSession();
  return (
    <LiveStreamRoom
      authorName={session?.name ?? "Desk staff"}
      authorEmail={session?.email}
      location="in-person"
      title="Live symposium stream"
      subtitle="Desk staff can monitor the plenary stream and audience queue."
    />
  );
}
