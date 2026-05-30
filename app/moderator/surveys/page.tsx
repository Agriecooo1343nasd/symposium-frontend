"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";

export default function ModeratorSurveysPage() {
  const store = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Survey feedback</h1>
        <p className="text-muted-foreground">Post-event delegate ratings and comments from the attendee survey.</p>
      </div>
      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-secondary/60 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Respondent</th>
              <th className="text-left px-4 py-3">Overall</th>
              <th className="text-right px-4 py-3">View</th>
            </tr>
          </thead>
          <tbody>
            {store.surveyResponses.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.respondentName}</div>
                  <div className="text-xs text-muted-foreground">{r.respondentEmail}</div>
                </td>
                <td className="px-4 py-3">{r.overall}/5</td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/moderator/surveys/${r.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Link>
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
