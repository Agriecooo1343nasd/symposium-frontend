import { useState } from "react";
import { Star, MessageSquare, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  isSessionEnded,
  getSessionRating,
  getSessionRatingSummary,
  submitSessionRating,
} from "@/lib/session-ratings";
import { useStore } from "@/hooks/use-store";
import { canViewSessionMaterials } from "@/lib/access";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/mock-data";
import { toast } from "sonner";

type Props = {
  session: Pick<Session, "id" | "title">;
  compact?: boolean;
};

export function SessionRatingPanel({ session, compact }: Props) {
  useStore();
  const auth = getSession();
  const canRate = canViewSessionMaterials();
  const ended = isSessionEnded(session.id);
  const existing = auth?.email ? getSessionRating(session.id, auth.email) : undefined;
  const summary = getSessionRatingSummary(session.id);

  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");

  if (!canRate) {
    if (compact) return null;
    return (
      <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Rate this session after it ends</p>
        <p className="mt-1">Sign in with a paid registration to leave feedback (FR-6.2).</p>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!ended) {
    return (
      <div className={cn("rounded-2xl border bg-secondary/30 p-4 sm:p-5 text-sm", compact && "p-4")}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Session rating opens when this session ends</p>
            <p className="text-xs mt-0.5">You will be able to rate 1–5 stars and leave an optional comment (FR-6.2).</p>
          </div>
        </div>
      </div>
    );
  }

  const submit = () => {
    if (!auth?.email) return;
    const res = submitSessionRating({
      session,
      attendeeEmail: auth.email,
      attendeeName: auth.name,
      stars,
      comment,
    });
    if (!res.ok) return toast.error(res.error);
    toast.success(existing ? "Rating updated" : "Thanks for your feedback!");
  };

  return (
    <div className={cn("rounded-2xl border bg-card p-4 sm:p-5", compact && "p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-serif font-bold text-sm sm:text-base inline-flex items-center gap-2">
            <Star className="h-4 w-4 text-gold" />
            Rate this session
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">FR-6.2 — 1–5 stars + optional comment</p>
        </div>
        {summary.count > 0 && (
          <div className="text-right text-xs">
            <div className="font-mono font-bold text-lg">{summary.average}</div>
            <div className="text-muted-foreground">{summary.count} attendee ratings</div>
          </div>
        )}
      </div>

      {existing && (
        <p className="text-xs text-green flex items-center gap-1 mb-3">
          <CheckCircle2 className="h-3.5 w-3.5" /> You rated this session — update below anytime.
        </p>
      )}

      <div className="flex gap-1 mb-4" role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="p-1 rounded-md hover:bg-secondary transition-colors"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(n)}
            aria-label={`${n} stars`}
          >
            <Star
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 transition-colors",
                (hover || stars) >= n ? "fill-gold text-gold" : "text-muted-foreground/35",
              )}
            />
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Label className="text-xs flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" /> Comment (optional)
        </Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={compact ? 2 : 3}
          className="mt-1 resize-none"
          placeholder="What worked well? What could improve?"
        />
      </div>

      <Button
        type="button"
        className="gradient-blue text-accent-foreground"
        disabled={stars < 1}
        onClick={submit}
      >
        {existing ? "Update rating" : "Submit rating"}
      </Button>
    </div>
  );
}
