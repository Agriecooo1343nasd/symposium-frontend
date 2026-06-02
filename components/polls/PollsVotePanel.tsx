"use client";

import { Radio } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { pollsForVoter } from "@/lib/live-polls";
import { PollVoteCard } from "./PollVoteCard";

export function PollsVotePanel() {
  const { session } = useAuth();
  const store = useStore();

  if (!session) return null;

  const { active, past } = pollsForVoter(store, session);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold flex items-center gap-2">
          <Radio className="h-8 w-8 text-accent" />
          Live polls
        </h1>
        <p className="text-muted-foreground mt-1">
          Vote during sessions when a poll is open for your role (FR-6.2). Results appear when organisers publish them.
        </p>
      </div>

      {active.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-green">Open now — cast your vote</h2>
          {active.map((poll) => (
            <PollVoteCard key={poll.id} poll={poll} session={session} store={store} />
          ))}
        </section>
      )}

      {active.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          No live polls are open for you right now. Check back during plenary sessions.
        </div>
      )}

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-lg font-bold">Past polls</h2>
          {past.map((poll) => (
            <PollVoteCard key={poll.id} poll={poll} session={session} store={store} />
          ))}
        </section>
      )}
    </div>
  );
}
