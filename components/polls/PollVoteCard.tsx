"use client";

import { useState } from "react";
import { CheckCircle2, Lock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MockSession } from "@/lib/mock-data";
import type { LivePoll, PollVote } from "@/lib/store";
import {
  canUserSeeResults,
  canUserVotePoll,
  getUserVote,
  submitPollVote,
  tallyPoll,
  findRegistrationByEmail,
} from "@/lib/live-polls";
import type { AppStore } from "@/lib/store";
import { PollResultsChart } from "./PollResultsChart";
import { toast } from "sonner";

export function PollVoteCard({
  poll,
  session,
  store,
  isManager = false,
}: {
  poll: LivePoll;
  session: MockSession;
  store: AppStore;
  isManager?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const reg = findRegistrationByEmail(store, session.email);
  const myVote = getUserVote(poll.id, session.email, store.pollVotes);
  const canVote = canUserVotePoll(session, poll, store.pollVotes, reg);
  const showResults = canUserSeeResults(session, poll, store.pollVotes, reg, isManager);
  const tally = tallyPoll(poll, store.pollVotes);
  const totalVotes = tally.reduce((a, t) => a + t.count, 0);

  const submit = () => {
    if (!selected) return;
    setSubmitting(true);
    const res = submitPollVote(session, poll.id, selected);
    setSubmitting(false);
    if (!res.ok) toast.error(res.error);
    else toast.success("Vote recorded — thank you!");
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] uppercase mb-2",
              poll.status === "open" && "border-green/50 text-green",
              poll.status === "closed" && "border-muted-foreground",
              poll.status === "draft" && "border-amber-400 text-amber-700",
            )}
          >
            {poll.status}
          </Badge>
          <h2 className="font-serif text-lg font-bold">{poll.title}</h2>
          <p className="text-sm text-foreground mt-1">{poll.question}</p>
          {poll.description && <p className="text-xs text-muted-foreground mt-1">{poll.description}</p>}
        </div>
      </div>

      {myVote && (
        <div className="flex items-center gap-2 text-sm text-green bg-green/10 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          You voted for: <strong>{poll.options.find((o) => o.id === myVote.optionId)?.label}</strong>
        </div>
      )}

      {canVote && (
        <div className="space-y-2">
          {poll.options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o.id)}
              className={cn(
                "w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors",
                selected === o.id
                  ? "border-accent bg-accent/10 font-medium"
                  : "border-border hover:border-accent/40 hover:bg-secondary/30",
              )}
            >
              {o.label}
            </button>
          ))}
          <Button className="w-full sm:w-auto" disabled={!selected || submitting} onClick={submit}>
            Submit vote
          </Button>
        </div>
      )}

      {poll.status === "open" && !canVote && !myVote && !isManager && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Lock className="h-4 w-4" /> This poll is not available for your account.
        </p>
      )}

      {poll.status === "closed" && !myVote && !showResults && (
        <p className="text-sm text-muted-foreground">This poll is closed. Results have not been published yet.</p>
      )}

      {showResults && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-accent" /> Results
            {!poll.resultsVisible && isManager && (
              <span className="text-[10px] font-normal text-muted-foreground">(staff preview)</span>
            )}
          </h3>
          <PollResultsChart tally={tally} totalVotes={totalVotes} />
        </div>
      )}
    </article>
  );
}
