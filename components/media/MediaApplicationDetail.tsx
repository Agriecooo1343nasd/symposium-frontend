"use client";

import Link from "next/link";
import { ArrowLeft, Check, X, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { MEDIA_PRESS_TYPE_LABELS, approveMediaApplication, rejectMediaApplication } from "@/lib/media-registration";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  applicationId: string;
  backHref: string;
  readOnly?: boolean;
};

export function MediaApplicationDetail({ applicationId, backHref, readOnly = false }: Props) {
  const store = useStore();
  const app = store.mediaApplications.find((a) => a.id === applicationId);
  const reg = app ? store.registrations.find((r) => r.id === app.registrationId) : undefined;
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectMsg, setRejectMsg] = useState("");

  if (!app) {
    return <p className="text-muted-foreground">Application not found.</p>;
  }

  const approve = () => {
    const res = approveMediaApplication(app.id, getSession()?.name ?? "Staff");
    if (!res.ok) return toast.error(res.error);
    toast.success("Media accreditation approved");
  };

  const reject = () => {
    if (!rejectMsg.trim()) return toast.error("Add a message for the applicant");
    const res = rejectMediaApplication(app.id, getSession()?.name ?? "Staff", rejectMsg.trim());
    if (!res.ok) return toast.error(res.error);
    toast.info("Application rejected");
    setRejectOpen(false);
  };

  const docLink = (name?: string, url?: string) =>
    url ? (
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline">
        <FileText className="h-3.5 w-3.5" /> {name}
        <ExternalLink className="h-3 w-3" />
      </a>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to media applications
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{app.name}</h1>
          <p className="text-muted-foreground">
            {app.pressName} · {MEDIA_PRESS_TYPE_LABELS[app.pressType]} ·{" "}
            <span className="capitalize">{app.status}</span>
          </p>
        </div>
        {!readOnly && app.status === "pending" && !rejectOpen && (
          <div className="flex gap-2">
            <Button className="gradient-blue text-accent-foreground" onClick={approve}>
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button variant="outline" onClick={() => setRejectOpen(true)}>
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        )}
      </div>

      {rejectOpen && (
        <div className="rounded-xl border p-4 space-y-3 max-w-lg">
          <Label>Rejection message</Label>
          <Textarea value={rejectMsg} onChange={(e) => setRejectMsg(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button variant="destructive" onClick={reject}>Confirm reject</Button>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-serif font-bold">Journalist</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-muted-foreground uppercase">Email</dt><dd className="mt-0.5">{app.email}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Phone</dt><dd className="mt-0.5">{app.phone}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Country</dt><dd className="mt-0.5">{app.country}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Role</dt><dd className="mt-0.5">{app.jobTitle}</dd></div>
            {app.socialHandle && (
              <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground uppercase">Social</dt><dd className="mt-0.5">{app.socialHandle}</dd></div>
            )}
          </dl>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-serif font-bold">Press outlet</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground uppercase">Outlet</dt><dd className="mt-0.5 font-medium">{app.pressName}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Type</dt><dd className="mt-0.5">{MEDIA_PRESS_TYPE_LABELS[app.pressType]}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Country</dt><dd className="mt-0.5">{app.pressCountry}</dd></div>
            {app.pressWebsite && (
              <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground uppercase">Website</dt><dd className="mt-0.5"><a href={app.pressWebsite} className="text-accent hover:underline" target="_blank" rel="noreferrer">{app.pressWebsite}</a></dd></div>
            )}
            {app.editorName && (
              <div><dt className="text-xs text-muted-foreground uppercase">Editor</dt><dd className="mt-0.5">{app.editorName}</dd></div>
            )}
            {app.editorEmail && (
              <div><dt className="text-xs text-muted-foreground uppercase">Editor email</dt><dd className="mt-0.5">{app.editorEmail}</dd></div>
            )}
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold mb-2">Coverage plan</h2>
        <p className="text-sm leading-relaxed">{app.coverageBrief}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold mb-4">Uploaded documents</h2>
        <ul className="space-y-3 text-sm">
          <li><span className="text-muted-foreground">Press credential: </span>{docLink(app.credentialFileName, app.credentialDataUrl)}</li>
          <li><span className="text-muted-foreground">Outlet letter: </span>{docLink(app.letterFileName, app.letterDataUrl)}</li>
          {app.assignmentFileName && (
            <li><span className="text-muted-foreground">Additional: </span>{docLink(app.assignmentFileName, app.assignmentDataUrl)}</li>
          )}
        </ul>
      </div>

      {reg && (
        <div className="rounded-xl bg-secondary/40 border p-4 text-sm">
          Linked registration: <span className="font-mono">{reg.details?.ticketId}</span> · status{" "}
          <span className="font-semibold capitalize">{reg.status}</span>
          {readOnly ? null : (
            <>
              {" "}
              ·{" "}
              <Link href={`/desk/registrations/${reg.id}`} className="text-accent font-medium hover:underline">
                View registration
              </Link>
            </>
          )}
        </div>
      )}

      {app.reviewMessage && (
        <p className="text-sm text-muted-foreground border-l-2 border-accent pl-3">{app.reviewMessage}</p>
      )}
    </div>
  );
}
