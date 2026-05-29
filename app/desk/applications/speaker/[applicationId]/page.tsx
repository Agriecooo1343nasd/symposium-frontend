"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { SpeakerAppReviewList } from "@/components/desk/SpeakerAppReview";

export default function DeskSpeakerApplicationDetailPage() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";
  const store = useStore();
  const app = store.speakerApplications.find((a) => a.id === applicationId);
  if (!app) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/desk/applications">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to applications
        </Link>
      </Button>

      <div>
        <h1 className="font-serif text-3xl font-bold">{app.name}</h1>
        <p className="text-muted-foreground">Full speaker application as submitted from the attendee dashboard.</p>
      </div>

      <div className="rounded-md bg-card border border-border p-6 space-y-4 text-sm">
        <dl className="grid sm:grid-cols-2 gap-4">
          {[
            ["Status", app.status],
            ["Email", app.email],
            ["Phone", app.phone],
            ["Country", app.country],
            ["Presentation type", app.presentationType],
            ["Submitted", app.submittedAt],
            ["Review message", app.reviewMessage],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground uppercase">{k}</dt>
              <dd className="mt-1 font-medium">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        <div>
          <dt className="text-xs text-muted-foreground uppercase">About</dt>
          <dd className="mt-1 leading-relaxed">{app.about}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground uppercase">Presentation title</dt>
          <dd className="mt-1 font-serif font-bold text-lg">{app.title}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground uppercase">Summary</dt>
          <dd className="mt-1 leading-relaxed">{app.summary}</dd>
        </div>
        {app.photoUrl && (
          <div>
            <dt className="text-xs text-muted-foreground uppercase mb-2">Profile photo</dt>
            <img src={app.photoUrl} alt="" className="h-24 w-24 rounded-full object-cover border border-border" />
          </div>
        )}
        {app.documentDataUrl && (
          <div>
            <dt className="text-xs text-muted-foreground uppercase mb-2">
              Abstract document ({app.documentName})
            </dt>
            <a
              href={app.documentDataUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent text-sm font-semibold hover:underline"
            >
              Open uploaded file
            </a>
          </div>
        )}
      </div>

      {app.status === "pending" && <SpeakerAppReviewList apps={[app]} />}
    </div>
  );
}
