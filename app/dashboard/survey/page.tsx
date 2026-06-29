"use client";

import { useMemo, useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useActiveSurveys, useSubmitSurveyResponse } from "@/hooks/api/useEngage";
import { apiErrorMessage } from "@/lib/api/client";

type SurveyQuestion = {
  id?: string;
  key?: string;
  label?: string;
  question?: string;
  text?: string;
  type?: string;
  options?: string[];
  required?: boolean;
};

function questionKey(q: SurveyQuestion, index: number): string {
  return q.id ?? q.key ?? `q${index}`;
}

function questionLabel(q: SurveyQuestion, index: number): string {
  return q.label ?? q.question ?? q.text ?? `Question ${index + 1}`;
}

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
  const { surveys, isLoading } = useActiveSurveys();
  const submitResponse = useSubmitSurveyResponse();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);

  const survey = surveys[0] ?? null;
  const questions = useMemo<SurveyQuestion[]>(
    () => (Array.isArray(survey?.questions) ? (survey!.questions as SurveyQuestion[]) : []),
    [survey],
  );

  const setAnswer = (key: string, value: unknown) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;
    try {
      await submitResponse.mutateAsync({ id: survey.id, dto: { answers } });
      setSubmitted(true);
      toast.success("Survey submitted");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl bg-card border border-border p-12 text-center">
        <CheckCircle2 className="h-12 w-12 mx-auto text-green mb-3" />
        <h1 className="font-serif text-2xl font-bold">Thank you</h1>
        <p className="text-muted-foreground">Your feedback helps shape the next NAS.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Event survey</h1>
      <p className="text-muted-foreground mb-6">Your feedback helps us improve future events.</p>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Loading survey…</div>
      ) : !survey ? (
        <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          No active surveys right now. Surveys open after the event — check back soon.
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-6 space-y-6">
          <h2 className="font-serif text-lg font-bold">{survey.title}</h2>
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">This survey has no questions configured.</p>
          ) : (
            questions.map((q, i) => {
              const key = questionKey(q, i);
              const label = questionLabel(q, i);
              const type = (q.type ?? "text").toLowerCase();
              return (
                <div key={key}>
                  <Label>{label}</Label>
                  <div className="mt-2">
                    {type === "rating" ? (
                      <Stars
                        value={Number(answers[key] ?? 0)}
                        onChange={(n) => setAnswer(key, n)}
                      />
                    ) : type === "choice" || type === "select" ? (
                      <div className="flex flex-wrap gap-2">
                        {(q.options ?? []).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswer(key, opt)}
                            className={cn(
                              "text-sm px-3 py-1.5 rounded-full border",
                              answers[key] === opt
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border",
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : type === "textarea" || type === "long_text" ? (
                      <Textarea
                        rows={3}
                        value={String(answers[key] ?? "")}
                        onChange={(e) => setAnswer(key, e.target.value)}
                      />
                    ) : (
                      <Input
                        value={String(answers[key] ?? "")}
                        onChange={(e) => setAnswer(key, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <Button
            type="submit"
            disabled={submitResponse.isPending}
            className="gradient-blue text-accent-foreground"
          >
            {submitResponse.isPending ? "Submitting…" : "Submit feedback"}
          </Button>
        </form>
      )}
    </div>
  );
}
