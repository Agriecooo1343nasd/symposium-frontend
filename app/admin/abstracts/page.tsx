"use client";

import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminSubmissions } from "@/hooks/api/useAdmin";
import { submissionPrimaryAuthor, submissionReviewStatus } from "@/lib/api/mappers/desk";

export default function Page() {
  const { submissions, isLoading, isError } = useAdminSubmissions({ limit: 200 });
  const grouped = {
    pending: submissions.filter((s) => submissionReviewStatus(s.status) === "pending"),
    approved: submissions.filter((s) => submissionReviewStatus(s.status) === "approved"),
    rejected: submissions.filter((s) => submissionReviewStatus(s.status) === "rejected"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Abstract submissions</h1>
        <p className="text-muted-foreground">Review submissions from `GET /submissions` (admin).</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading submissions…</p>}
      {isError && <p className="text-sm text-destructive">Could not load submissions.</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {(["pending", "approved", "rejected"] as const).map((status) => (
          <div key={status} className="rounded-2xl bg-card border p-4 text-center">
            <div className="font-serif text-2xl font-bold">{grouped[status].length}</div>
            <div className="text-xs uppercase text-muted-foreground capitalize">{status}</div>
          </div>
        ))}
      </div>

      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Author</th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">File</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{submissionPrimaryAuthor(s)}</div>
                  <div className="text-xs text-muted-foreground font-mono">{s.userId.slice(0, 8)}…</div>
                </td>
                <td className="px-4 py-3 max-w-[220px]">
                  <div className="font-medium line-clamp-2">{s.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.abstract}</div>
                </td>
                <td className="px-4 py-3 text-xs">{s.presentationType}</td>
                <td className="px-4 py-3 text-xs">
                  {s.fileUrl ? (
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-accent" /> Attached
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary">
                    {s.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/abstracts/${s.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Review
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && !isLoading && (
          <p className="p-8 text-sm text-muted-foreground text-center">No submissions yet.</p>
        )}
      </div>
    </div>
  );
}
