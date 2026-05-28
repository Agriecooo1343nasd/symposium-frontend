"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEventConfig } from "@/lib/platform-settings";
import { getSession } from "@/lib/auth";
import { patchStore, uid } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={cn("h-6 w-6", n <= value ? "fill-gold text-gold" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

export default function DashboardSurveyPage() {
  const [now] = useState(() => Date.now());
  const event = getEventConfig();
  const session = getSession();
  const eventOver = now > event.endDate.getTime();
  const [overall, setOverall] = useState(0);
  const [content, setContent] = useState(0);
  const [venue, setVenue] = useState(0);
  const [networking, setNetworking] = useState(0);
  const [highlight, setHighlight] = useState("");
  const [improve, setImprove] = useState("");
  const [recommend, setRecommend] = useState("yes");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    patchStore((s) => ({
      ...s,
      surveyResponses: [
        {
          id: uid("sv"),
          respondentName: session.name,
          respondentEmail: session.email,
          overall,
          content,
          venue,
          networking,
          highlight,
          improve,
          recommend,
          submittedAt: new Date().toISOString(),
        },
        ...s.surveyResponses,
      ],
    }));
    setSubmitted(true);
    toast.success("Survey submitted");
  };

  if (submitted) {
    return (
      <div className="rounded-3xl bg-card border border-border p-12 text-center">
        <CheckCircle2 className="h-12 w-12 mx-auto text-green mb-3" />
        <h1 className="font-serif text-2xl font-bold">Thank you</h1>
        <p className="text-muted-foreground">Your feedback helps shape the 4th NAS.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Post-event survey</h1>
      <p className="text-muted-foreground mb-6">5 minutes - helps us plan NAS 2028.</p>

      {!eventOver && (
        <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          The survey unlocks after the closing ceremony. Preview below.
        </div>
      )}

      <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-6 space-y-6">
        <div>
          <Label>Overall event rating</Label>
          <div className="mt-2">
            <Stars value={overall} onChange={setOverall} />
          </div>
        </div>
        <div>
          <Label>Content & sessions quality</Label>
          <div className="mt-2">
            <Stars value={content} onChange={setContent} />
          </div>
        </div>
        <div>
          <Label>Venue & catering</Label>
          <div className="mt-2">
            <Stars value={venue} onChange={setVenue} />
          </div>
        </div>
        <div>
          <Label>Networking opportunities</Label>
          <div className="mt-2">
            <Stars value={networking} onChange={setNetworking} />
          </div>
        </div>
        <div>
          <Label>Event highlight</Label>
          <Textarea value={highlight} onChange={(e) => setHighlight(e.target.value)} rows={2} className="mt-1" />
        </div>
        <div>
          <Label>What should we improve?</Label>
          <Textarea value={improve} onChange={(e) => setImprove(e.target.value)} rows={3} className="mt-1" />
        </div>
        <Button type="submit" disabled={!eventOver || overall < 1} className="gradient-blue text-accent-foreground">
          Submit feedback
        </Button>
      </form>
    </div>
  );
}
