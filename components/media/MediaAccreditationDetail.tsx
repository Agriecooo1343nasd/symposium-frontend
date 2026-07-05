"use client";

import Link from "next/link";
import { ArrowLeft, Check, X, Ban, Loader2 } from "lucide-react";
import { FileViewLink } from "@/components/file-viewer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMediaAccreditation, useUpdateMediaAccreditation } from "@/hooks/api/useMediaAccreditation";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import { useState } from "react";
import type { MediaAccreditationExtended } from "@/lib/api/dto";
import { cn } from "@/lib/utils";

type Props = {
  applicationId: string;
  backHref: string;
  readOnly?: boolean;
};

function formatSubmitted(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
}

export function MediaAccreditationDetail({ applicationId, backHref, readOnly = false }: Props) {
  const { accreditation, isLoading, isError } = useMediaAccreditation(applicationId);
  const update = useUpdateMediaAccreditation();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectMsg, setRejectMsg] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading application…
      </div>
    );
  }

  if (isError || !accreditation) {
    return <p className="text-muted-foreground">Application not found or access denied.</p>;
  }

  const app = accreditation as MediaAccreditationExtended;

  const statusClass =
    app.status === "approved"
      ? "bg-green/15 text-green"
      : app.status === "rejected" || app.status === "revoked"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-800";

  const approve = () => {
    update.mutate(
      { id: app.id, dto: { status: "approved" } },
      {
        onSuccess: () => toast.success("Media accreditation approved"),
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const reject = () => {
    if (!rejectMsg.trim()) return toast.error("Add a message for the applicant");
    update.mutate(
      { id: app.id, dto: { status: "rejected", adminNotes: rejectMsg.trim() } },
      {
        onSuccess: () => {
          toast.info("Application rejected");
          setRejectOpen(false);
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const revoke = () => {
    update.mutate(
      { id: app.id, dto: { status: "revoked", adminNotes: "Accreditation revoked by admin" } },
      {
        onSuccess: () => toast.info("Accreditation revoked"),
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to media applications
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{app.fullName}</h1>
          <p className="text-muted-foreground mt-1">
            {app.outletName} · {app.outletType ?? "Press"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Submitted {formatSubmitted(app.createdAt)}</p>
        </div>
        <span className={cn("text-[10px] uppercase font-bold px-2.5 py-1 rounded-full", statusClass)}>{app.status}</span>
      </div>

      {!readOnly && app.status === "pending" && !rejectOpen && (
        <div className="flex flex-wrap gap-2">
          <Button className="gradient-blue text-accent-foreground" disabled={update.isPending} onClick={approve}>
            <Check className="h-4 w-4 mr-1" /> Approve accreditation
          </Button>
          <Button variant="outline" onClick={() => setRejectOpen(true)}>
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      )}

      {!readOnly && app.status === "approved" && (
        <Button variant="outline" disabled={update.isPending} onClick={revoke}>
          <Ban className="h-4 w-4 mr-1" /> Revoke accreditation
        </Button>
      )}

      {rejectOpen && (
        <div className="rounded-xl border p-4 space-y-3 max-w-lg bg-card">
          <Label>Rejection message to applicant</Label>
          <Textarea value={rejectMsg} onChange={(e) => setRejectMsg(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button variant="destructive" onClick={reject} disabled={update.isPending}>
              Confirm reject
            </Button>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-serif font-bold">Journalist</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Email</dt>
              <dd className="mt-0.5">
                <a href={`mailto:${app.email}`} className="text-accent hover:underline">
                  {app.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Phone</dt>
              <dd className="mt-0.5">{app.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Country</dt>
              <dd className="mt-0.5">{app.country ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Job title</dt>
              <dd className="mt-0.5">{app.jobTitle ?? "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-serif font-bold">Press outlet</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground uppercase">Outlet</dt>
              <dd className="mt-0.5 font-medium">{app.outletName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Type</dt>
              <dd className="mt-0.5">{app.outletType ?? "—"}</dd>
            </div>
            {app.outletCountry && (
              <div>
                <dt className="text-xs text-muted-foreground uppercase">Outlet country</dt>
                <dd className="mt-0.5">{app.outletCountry}</dd>
              </div>
            )}
            {app.outletWebsite && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground uppercase">Website</dt>
                <dd className="mt-0.5">
                  <a href={app.outletWebsite} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                    {app.outletWebsite}
                  </a>
                </dd>
              </div>
            )}
            {app.editorName && (
              <div>
                <dt className="text-xs text-muted-foreground uppercase">Editor</dt>
                <dd className="mt-0.5">{app.editorName}</dd>
              </div>
            )}
            {app.editorEmail && (
              <div>
                <dt className="text-xs text-muted-foreground uppercase">Editor email</dt>
                <dd className="mt-0.5">{app.editorEmail}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground uppercase">Coverage plan</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">{app.coverageType ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {app.equipmentNeeds && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-serif font-bold mb-2">Equipment / social</h2>
          <p className="text-sm leading-relaxed">{app.equipmentNeeds}</p>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold mb-4">Documents</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase text-muted-foreground mb-1">Press credential</p>
            {app.pressCardUrl ? (
              <FileViewLink src={app.pressCardUrl} fileName="press-credential" />
            ) : (
              <p className="text-muted-foreground">None on file</p>
            )}
          </div>
          {app.letterUrl && (
            <div>
              <p className="text-xs uppercase text-muted-foreground mb-1">Outlet letter</p>
              <FileViewLink src={app.letterUrl} fileName="outlet-letter" />
            </div>
          )}
          {app.assignmentUrl && (
            <div>
              <p className="text-xs uppercase text-muted-foreground mb-1">Assignment letter</p>
              <FileViewLink src={app.assignmentUrl} fileName="assignment-letter" />
            </div>
          )}
        </div>
        {app.manuallyAdded && (
          <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
            Added manually by staff. Welcome email / portal invite is sent when the backend admin onboarding endpoint is live.
          </p>
        )}
      </div>

      {app.adminNotes && (
        <div className="rounded-xl border-l-4 border-accent bg-secondary/30 p-4">
          <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Admin notes</p>
          <p className="text-sm">{app.adminNotes}</p>
        </div>
      )}
    </div>
  );
}
