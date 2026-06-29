"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeskSubmissionReviewList } from "@/components/desk/DeskSubmissionReview";
import { FileViewLink } from "@/components/file-viewer";
import { useSubmissionDetail } from "@/hooks/api/useDesk";
import { submissionPrimaryAuthor, submissionReviewStatus } from "@/lib/api/mappers/desk";

export default function DeskSpeakerApplicationDetailPage() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";
  const { data: app, isLoading, isError } = useSubmissionDetail(applicationId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading submission…</p>;
  if (isError || !app) notFound();

  const uiStatus = submissionReviewStatus(app.status);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/desk/applications">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to applications
        </Link>
      </Button>

      <div>
        <h1 className="font-serif text-3xl font-bold">{app.title}</h1>
        <p className="text-muted-foreground">
          {submissionPrimaryAuthor(app)} · {app.presentationType} · {app.status.replace(/_/g, " ")}
        </p>
      </div>

      <div className="rounded-md bg-card border border-border p-6 space-y-4 text-sm">
        <dl className="grid sm:grid-cols-2 gap-4">
          {[
            ["Status", app.status],
            ["Sub-theme", app.subTheme],
            ["Submitted", new Date(app.createdAt).toLocaleString()],
            ["Updated", new Date(app.updatedAt).toLocaleString()],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground uppercase">{k}</dt>
              <dd className="mt-1 font-medium">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        <div>
          <dt className="text-xs text-muted-foreground uppercase">Abstract</dt>
          <dd className="mt-1 leading-relaxed whitespace-pre-wrap">{app.abstract}</dd>
        </div>
        {app.authors.length > 0 && (
          <div>
            <dt className="text-xs text-muted-foreground uppercase mb-2">Authors</dt>
            <ul className="space-y-1">
              {app.authors.map((a) => (
                <li key={a.id}>
                  {a.name}
                  {a.affiliation ? ` · ${a.affiliation}` : ""}
                  {a.isPrimary ? " (primary)" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        {app.fileUrl && (
          <div>
            <dt className="text-xs text-muted-foreground uppercase mb-2">Document</dt>
            <FileViewLink src={app.fileUrl} fileName="abstract.pdf" />
          </div>
        )}
      </div>

      {uiStatus === "pending" && <DeskSubmissionReviewList submissions={[app]} />}
    </div>
  );
}
