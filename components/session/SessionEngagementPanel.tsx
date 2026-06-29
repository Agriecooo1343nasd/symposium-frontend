"use client";

import { useState } from "react";
import { MessageSquare, BarChart3, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  useAskQuestion,
  useSessionPolls,
  useSessionQuestions,
  useVotePoll,
} from "@/hooks/api/useEngage";
import { apiErrorMessage } from "@/lib/api/client";

export function SessionEngagementPanel({ sessionId }: { sessionId: string }) {
  const { isAuthenticated } = useAuth();
  const { questions, isLoading: loadingQ } = useSessionQuestions(isAuthenticated ? sessionId : null);
  const { polls, isLoading: loadingP } = useSessionPolls(isAuthenticated ? sessionId : null);
  const ask = useAskQuestion(sessionId);
  const vote = useVotePoll(sessionId);
  const [draft, setDraft] = useState("");
  const [voted, setVoted] = useState<Record<string, number>>({});

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Sign in as a registered attendee to ask questions and vote in live polls.
      </div>
    );
  }

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    try {
      await ask.mutateAsync({ content });
      setDraft("");
      toast.success("Question submitted for moderation");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const castVote = async (pollId: string, optionIndex: number) => {
    try {
      await vote.mutateAsync({ pollId, dto: { optionIndex } });
      setVoted((prev) => ({ ...prev, [pollId]: optionIndex }));
      toast.success("Vote recorded");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-serif text-lg font-bold mb-3 inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" /> Q&amp;A
        </h3>
        <form onSubmit={submitQuestion} className="space-y-2 mb-4">
          <Textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask the speaker a question…"
          />
          <Button
            type="submit"
            size="sm"
            disabled={ask.isPending || !draft.trim()}
            className="gradient-blue text-accent-foreground"
          >
            <Send className="h-3.5 w-3.5 mr-1" /> {ask.isPending ? "Sending…" : "Submit question"}
          </Button>
        </form>
        {loadingQ ? (
          <p className="text-sm text-muted-foreground">Loading questions…</p>
        ) : questions.filter((q) => q.isDisplayed || q.isApproved).length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions displayed yet. Be the first to ask.</p>
        ) : (
          <ul className="space-y-2">
            {questions
              .filter((q) => q.isDisplayed || q.isApproved)
              .map((q) => (
                <li key={q.id} className="rounded-xl border border-border bg-card p-3 text-sm">
                  {q.content}
                </li>
              ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-serif text-lg font-bold mb-3 inline-flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" /> Live polls
        </h3>
        {loadingP ? (
          <p className="text-sm text-muted-foreground">Loading polls…</p>
        ) : polls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No polls for this session yet.</p>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => {
              const total = (poll.results ?? []).reduce((a, b) => a + b, 0);
              const hasVoted = voted[poll.id] !== undefined;
              return (
                <div key={poll.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="font-medium text-sm mb-3">{poll.question}</div>
                  <div className="space-y-2">
                    {poll.options.map((opt, idx) => {
                      const count = poll.results?.[idx] ?? 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      const showResults = hasVoted || !poll.isActive;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!poll.isActive || hasVoted || vote.isPending}
                          onClick={() => castVote(poll.id, idx)}
                          className={cn(
                            "w-full text-left rounded-xl border p-2.5 text-sm relative overflow-hidden",
                            voted[poll.id] === idx ? "border-accent" : "border-border",
                            poll.isActive && !hasVoted ? "hover:border-accent" : "",
                          )}
                        >
                          {showResults && (
                            <span
                              className="absolute inset-y-0 left-0 bg-accent/10"
                              style={{ width: `${pct}%` }}
                            />
                          )}
                          <span className="relative flex justify-between items-center">
                            <span className="inline-flex items-center gap-1.5">
                              {voted[poll.id] === idx && <CheckCircle2 className="h-3.5 w-3.5 text-accent" />}
                              {opt}
                            </span>
                            {showResults && <span className="font-mono text-xs">{pct}%</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {!poll.isActive && <div className="text-xs text-muted-foreground mt-2">Closed</div>}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
