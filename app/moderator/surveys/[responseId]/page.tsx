"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

function RatingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={cn("h-4 w-4", i <= value ? "fill-gold text-gold" : "text-muted-foreground/30")} />
          ))}
        </div>
        <span className="text-sm font-mono text-muted-foreground">{value}/5</span>
      </div>
    </div>
  );
}

export default function ModeratorSurveyDetailPage() {
  const params = useParams();
  const responseId = typeof params.responseId === "string" ? params.responseId : "";
  const store = useStore();
  const r = store.surveyResponses.find((x) => x.id === responseId);
  if (!r) notFound();

  const recommendLabel =
    r.recommend === "yes" ? "Yes, definitely" : r.recommend === "maybe" ? "Maybe" : "No";

  return (
    <div className="space-y-6 max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/moderator/surveys">
          <ArrowLeft className="h-4 w-4 mr-1" /> All survey responses
        </Link>
      </Button>

      <div>
        <h1 className="font-serif text-3xl font-bold">{r.respondentName}</h1>
        <p className="text-muted-foreground">
          {r.respondentEmail} · submitted{" "}
          {new Date(r.submittedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      <div className="rounded-2xl bg-card border p-6 space-y-1">
        <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Ratings</h2>
        <RatingRow label="Overall event" value={r.overall} />
        <RatingRow label="Content & sessions" value={r.content} />
        <RatingRow label="Venue & catering" value={r.venue} />
        <RatingRow label="Networking" value={r.networking} />
      </div>

      <div className="rounded-2xl bg-card border p-6 space-y-4">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Will attend NAS 2028?
          </h2>
          <p className="text-sm font-medium">{recommendLabel}</p>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Event highlight</h2>
          <p className="text-sm leading-relaxed">{r.highlight || "—"}</p>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            What should we improve?
          </h2>
          <p className="text-sm leading-relaxed">{r.improve || "—"}</p>
        </div>
      </div>
    </div>
  );
}
