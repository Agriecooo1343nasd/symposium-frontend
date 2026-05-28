import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { patchStore, type SurveyResponse } from "@/lib/store";
import { toast } from "sonner";

export function SurveyReviewTable() {
  const store = useStore();
  const [view, setView] = useState<SurveyResponse | null>(null);

  const remove = (id: string) => {
    patchStore((s) => ({ ...s, surveyResponses: s.surveyResponses.filter((r) => r.id !== id) }));
    toast.info("Response removed");
    setView(null);
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase"><tr><th className="text-left px-4 py-3">Respondent</th><th className="text-left px-4 py-3">Overall</th><th className="text-left px-4 py-3">Date</th><th></th></tr></thead>
          <tbody>
            {store.surveyResponses.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3"><div className="font-medium">{r.respondentName}</div><div className="text-xs text-muted-foreground">{r.respondentEmail}</div></td>
                <td className="px-4 py-3">{r.overall}/5</td>
                <td className="px-4 py-3">{r.submittedAt.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {store.surveyResponses.length === 0 && <p className="p-6 text-sm text-muted-foreground text-center">No survey responses yet.</p>}
      </div>
      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.respondentName}</DialogTitle></DialogHeader>
          {view && (
            <dl className="text-sm space-y-2">
              {[["Overall", view.overall], ["Content", view.content], ["Venue", view.venue], ["Networking", view.networking], ["Highlight", view.highlight], ["Improve", view.improve], ["Recommend", view.recommend]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-muted-foreground uppercase">{k}</dt><dd>{String(v)}</dd></div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
