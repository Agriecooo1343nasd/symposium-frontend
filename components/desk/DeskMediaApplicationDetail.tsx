"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { FileViewLink } from "@/components/file-viewer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMediaAccreditation, useUpdateMediaAccreditation } from "@/hooks/api/useDesk";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  applicationId: string;
  backHref: string;
  readOnly?: boolean;
};

export function DeskMediaApplicationDetail({ applicationId, backHref, readOnly = false }: Props) {
  const { accreditation, isLoading, isError } = useMediaAccreditation(applicationId);
  const update = useUpdateMediaAccreditation();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectMsg, setRejectMsg] = useState("");

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading application…</p>;
  if (isError || !accreditation) {
    return <p className="text-muted-foreground">Application not found or access denied.</p>;
  }

  const app = accreditation;

  const approve = () => {
    update.mutate(
      { id: app.id, dto: { status: "approved" } },
      {
        onSuccess: () => toast.success("Media accreditation approved"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Approval failed"),
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
        onError: (e) => toast.error(e instanceof Error ? e.message : "Rejection failed"),
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
          <p className="text-muted-foreground">
            {app.outletName} · {app.outletType ?? "Press"} · <span className="capitalize">{app.status}</span>
          </p>
        </div>
        {!readOnly && app.status === "pending" && !rejectOpen && (
          <div className="flex gap-2">
            <Button className="gradient-blue text-accent-foreground" disabled={update.isPending} onClick={approve}>
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
              <dd className="mt-0.5">{app.email}</dd>
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
              <dt className="text-xs text-muted-foreground uppercase">Role</dt>
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
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Coverage</dt>
              <dd className="mt-0.5">{app.coverageType ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {app.equipmentNeeds && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-serif font-bold mb-2">Equipment needs</h2>
          <p className="text-sm leading-relaxed">{app.equipmentNeeds}</p>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold mb-4">Documents</h2>
        {app.pressCardUrl ? (
          <FileViewLink src={app.pressCardUrl} fileName="press-credential" />
        ) : (
          <p className="text-sm text-muted-foreground">No press credential on file.</p>
        )}
      </div>

      {app.adminNotes && (
        <p className="text-sm text-muted-foreground border-l-2 border-accent pl-3">{app.adminNotes}</p>
      )}
    </div>
  );
}
