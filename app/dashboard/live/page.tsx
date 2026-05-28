"use client";

import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { LiveStreamRoom } from "@/components/live/LiveStreamRoom";

export default function DashboardLivePage() {
  const { session } = useAuth();
  const store = useStore();
  const isVirtual =
    session?.category?.toLowerCase().includes("virtual") ||
    store.registrations.find((r) => r.email === session?.email)?.categoryId === "virtual";

  return (
    <LiveStreamRoom
      authorName={session?.name ?? "Attendee"}
      authorEmail={session?.email}
      location={isVirtual ? "virtual" : "in-person"}
      subtitle="Simulated Zoom video with a live comment feed - questions queue for the moderator."
    />
  );
}
