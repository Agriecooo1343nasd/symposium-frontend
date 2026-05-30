"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Users, DollarSign, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditOrganizationDialog } from "@/components/exhibitors/EditOrganizationDialog";
import { useStore } from "@/hooks/use-store";

export default function DeskExhibitorApplicationDetailPage() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";
  const store = useStore();
  const app = store.organizationApplications.find((a) => a.id === applicationId);
  if (!app) notFound();

  const tier = app.sponsorshipTier ? store.sponsorshipTiers.find((t) => t.tier === app.sponsorshipTier) : null;
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/desk/exhibitors/applications">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to exhibitor applications
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{app.companyName}</h1>
          <p className="text-muted-foreground capitalize">
            {app.participation}
            {app.sponsorshipTier && ` · ${app.sponsorshipTier}`} · {app.status}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
      </div>

      <div className="rounded-md border border-blue/30 bg-blue/5 p-4 text-sm space-y-2">
        <p className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" /> Staff & payment model
        </p>
        <p className="text-muted-foreground">
          The organization pays the booth/sponsor package below. Invited staff receive comp passes and check in with
          STAFF-* QR codes at the desk. Final approval and booth assignment are completed in Admin → Exhibitors.
        </p>
        {app.quotedFeeUsd != null && (
          <p className="flex items-center gap-2 font-medium">
            <DollarSign className="h-4 w-4 text-accent" />
            Quoted fee at application: ${app.quotedFeeUsd.toLocaleString()} USD ({app.paymentStatus})
            {app.staffCount != null && ` · ${app.staffCount} staff requested`}
          </p>
        )}
      </div>

      <div className="rounded-md bg-card border border-border p-6">
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ["Company", app.companyName],
            ["Org type", app.orgType],
            ["Website", app.website],
            ["Participation", app.participation],
            ["Sponsorship tier", app.sponsorshipTier],
            ["Booth preference", app.boothPreference],
            ["Contact", app.contactName],
            ["Email", app.contactEmail],
            ["Phone", app.contactPhone],
            ["Payment status", app.paymentStatus],
            ["Submitted", app.submittedAt],
            ["Review message", app.reviewMessage],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground uppercase">{k}</dt>
              <dd className="mt-1 font-medium break-words">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4">
          <dt className="text-xs text-muted-foreground uppercase">Description</dt>
          <dd className="mt-1 text-sm leading-relaxed">{app.description}</dd>
        </div>
      </div>

      {tier && (
        <div className="rounded-md bg-secondary/40 border border-border p-5 text-sm">
          <h3 className="font-serif font-bold mb-2">{tier.tier} package</h3>
          <p>
            Base ${tier.baseFeeUsd.toLocaleString()} · {tier.staffPasses} staff included · $
            {tier.extraStaffFeeUsd}/extra staff
          </p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {tier.benefits.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </div>
      )}
      <EditOrganizationDialog applicationId={app.id} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
