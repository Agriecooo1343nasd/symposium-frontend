"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle2, Pencil } from "lucide-react";
import { useState } from "react";
import { EditOrganizationDialog } from "@/components/exhibitors/EditOrganizationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/use-store";
import { patchStore, appendAudit, uid } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { issueSponsorshipInvoice, getInvoicesForApplication, markInvoicePaid } from "@/lib/sponsorship-invoices";
import { toast } from "sonner";

export default function Page() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";
  const store = useStore();
  const session = getSession();
  const app = store.organizationApplications.find((a) => a.id === applicationId);
  if (!app) notFound();

  const invoices = getInvoicesForApplication(applicationId);
  const preferred = app.preferredBoothId ? store.booths.find((b) => b.id === app.preferredBoothId) : null;
  const [boothCode, setBoothCode] = useState(app.boothAssignment ?? preferred?.code ?? "");
  const [editOpen, setEditOpen] = useState(false);
  const isSponsor = app.participation === "sponsor" || app.participation === "both";

  const fields: [string, string | number | undefined][] = [
    ["Company", app.companyName],
    ["Organization type", app.orgType],
    ["Participation", app.participation],
    ["Sponsorship tier", app.sponsorshipTier],
    ["Website", app.website],
    ["Status", app.status],
    ["Payment", app.paymentStatus],
    ["Quoted fee (USD)", app.quotedFeeUsd != null ? `$${app.quotedFeeUsd}` : undefined],
    ["Staff count", app.staffCount],
    ["Staff emails", app.staffMemberEmails?.join(", ")],
    ["Contact name", app.contactName],
    ["Contact email", app.contactEmail],
    ["Contact phone", app.contactPhone],
    ["Booth preference notes", app.boothPreference],
    ["Preferred booth", preferred ? `${preferred.code} · ${preferred.location} (cap ${preferred.capacity})` : undefined],
    ["Assigned booth", app.boothAssignment],
    ["Logo file", app.logoFileName],
    ["Submitted", app.submittedAt],
    ["Review message", app.reviewMessage],
  ];

  const approveAndInvoice = () => {
    const booth = boothCode.trim() || preferred?.code || `B-${Math.floor(Math.random() * 20) + 1}`;
    const orgId = uid("org");
    patchStore((s) => ({
      ...s,
      organizationApplications: s.organizationApplications.map((a) =>
        a.id === app.id ? { ...a, status: "approved" as const, boothAssignment: booth } : a,
      ),
      approvedOrganizations: [
        ...s.approvedOrganizations.filter((o) => o.applicationId !== app.id),
        {
          id: orgId,
          applicationId: app.id,
          name: app.companyName,
          participation: app.participation,
          sponsorshipTier: app.sponsorshipTier,
          booth,
          category: app.orgType,
          description: app.description,
          contact: app.contactEmail,
          leads: 0,
          profileViews: 0,
          brochureDownloads: 0,
        },
      ],
      booths: s.booths.map((b) =>
        b.code === booth ? { ...b, status: "occupied" as const, assignedOrgId: orgId } : b,
      ),
    }));

    if (isSponsor && app.sponsorshipTier) {
      const inv = issueSponsorshipInvoice(app, session?.name ?? "Admin", orgId);
      toast.success(`Approved — proforma invoice ${inv.reference} issued (FR-5.1)`);
    } else {
      appendAudit(session?.name ?? "Admin", "Approved exhibitor application", app.companyName);
      toast.success("Approved — exhibitor portal access granted");
    }
  };

  const reject = () => {
    patchStore((s) => ({
      ...s,
      organizationApplications: s.organizationApplications.map((a) =>
        a.id === app.id ? { ...a, status: "rejected" as const } : a,
      ),
    }));
    toast.info("Application rejected");
  };

  return (
    <div className="space-y-6 ">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/exhibitors/applications">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to applications
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{app.companyName}</h1>
          <p className="text-muted-foreground">
            FR-5.1 — Review sponsorship/exhibitor application. Approving a sponsor triggers a payment invoice for the
            sponsorship fee.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
      </div>

      <div className="rounded-md bg-card border border-border p-6">
        <h2 className="font-serif font-bold mb-4">Application details</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{k}</dt>
              <dd className="mt-1 font-medium break-words capitalize">{v != null && v !== "" ? String(v) : "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-md bg-secondary/40 border border-border p-5">
        <h3 className="font-serif font-bold text-sm mb-2">Showcase description</h3>
        <p className="text-sm leading-relaxed">{app.description}</p>
      </div>

      {invoices.length > 0 && (
        <div className="rounded-md border bg-card p-5 space-y-3">
          <h3 className="font-serif font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" /> Sponsorship invoices
          </h3>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex flex-wrap justify-between gap-3 text-sm border rounded-lg p-3">
              <div>
                <div className="font-mono font-bold">{inv.reference}</div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  ${inv.amountUsd.toLocaleString()} · RWF {inv.amountRwf.toLocaleString()} · due {inv.dueDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary">{inv.status}</span>
                {inv.status !== "paid" && (
                  <Button size="sm" variant="outline" onClick={() => { markInvoicePaid(inv.id, session?.name ?? "Admin"); toast.success("Payment recorded"); }}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {app.status === "pending" && (
        <div className="rounded-md border border-border bg-card p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            {isSponsor
              ? "Approve will create the organization record, assign a booth, and automatically issue a proforma sponsorship invoice to the contact email."
              : "Approve will grant exhibitor portal access and assign a booth."}
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <Label>Booth to assign</Label>
              <Input value={boothCode} onChange={(e) => setBoothCode(e.target.value)} placeholder={preferred?.code ?? "A-01"} className="mt-1" />
            </div>
            <Button className="gradient-blue text-accent-foreground" onClick={approveAndInvoice}>
              {isSponsor ? "Approve & issue invoice" : "Approve & assign"}
            </Button>
            <Button variant="outline" onClick={reject}>Reject</Button>
          </div>
        </div>
      )}
      <EditOrganizationDialog applicationId={app.id} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
