"use client";

import { LiveStreamRoom } from "@/components/live/LiveStreamRoom";
import { useAuth } from "@/hooks/use-auth";


export default function Page() {
  const { session } = useAuth();
  return (
    <LiveStreamRoom
      authorName={session?.name ?? "Exhibitor"}
      authorEmail={session?.email}
      location="in-person"
      title="Live session"
      subtitle="Watch plenary sessions while managing your booth."
    />
  );
}
