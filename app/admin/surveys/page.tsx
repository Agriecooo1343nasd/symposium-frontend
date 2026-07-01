"use client";

import Link from "next/link";
import { Eye, Trash2, Star, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { patchStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useAdminSurveys, useSurveyResults } from "@/hooks/api/useEngage";


function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i <= n ? "fill-gold text-gold" : "text-muted-foreground/40")} />
      ))}
    </span>
  );
}

export default function Page() {
  const store = useStore();

  const remove = (id: string) => {
    patchStore((s) => ({ ...s, surveyResponses: s.surveyResponses.filter((r) => r.id !== id) }));
    toast.info("Response removed");
  };

  const avg = store.surveyResponses.length
    ? (store.surveyResponses.reduce((a, r) => a + r.overall, 0) / store.surveyResponses.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Survey responses</h1>
        <p className="text-muted-foreground">
          Post-event feedback from attendees (FR-8.3) · {store.surveyResponses.length} responses · avg {avg}/5
        </p>
      </div>

      <BackendSurveysPanel />

      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Respondent</th>
              <th className="text-left px-4 py-3">Overall</th>
              <th className="text-left px-4 py-3">Recommend NAS 2028</th>
              <th className="text-left px-4 py-3">Submitted</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.surveyResponses.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.respondentName}</div>
                  <div className="text-xs text-muted-foreground">{r.respondentEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <Stars n={r.overall} />
                </td>
                <td className="px-4 py-3 capitalize">{r.recommend}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.submittedAt.slice(0, 10)}</td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline" className="mr-1">
                    <Link href={`/admin/surveys/${r.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> View response
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {store.surveyResponses.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No survey responses yet.</p>
        )}
      </div>
    </div>
  );
}

function BackendSurveysPanel() {
  const { surveys, isLoading } = useAdminSurveys();
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: results, isLoading: loadingResults } = useSurveyResults(openId);

  return (
    <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-accent" />
        <h2 className="font-serif font-bold">Live surveys</h2>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading surveys…</p>
      ) : surveys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No surveys configured in the backend yet.</p>
      ) : (
        <div className="space-y-2">
          {surveys.map((s) => (
            <div key={s.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{s.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {Array.isArray(s.questions) ? s.questions.length : 0} questions ·{" "}
                    {s.isActive ? "Active" : "Closed"}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenId(openId === s.id ? null : s.id)}
                >
                  {openId === s.id ? "Hide results" : "View results"}
                </Button>
              </div>
              {openId === s.id && (
                <div className="mt-3 border-t border-border pt-3 text-sm">
                  {loadingResults ? (
                    <p className="text-muted-foreground">Loading results…</p>
                  ) : results ? (
                    <div className="space-y-1">
                      <div className="text-muted-foreground">
                        {results.responseCount} response{results.responseCount === 1 ? "" : "s"}
                      </div>
                      <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-secondary/50 p-3 text-xs">
                        {JSON.stringify(results.aggregates, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No results available.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
