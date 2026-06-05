"use client";

import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  FileText,
  Mail,
  ExternalLink,
  Store,
  Users,
  Download,
  BarChart3,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getInvoicesForOrg, markInvoicePaid } from "@/lib/sponsorship-invoices";
import { getDeliverablesForOrg } from "@/lib/sponsorship-deliverables";
import { getCarouselSponsorPeers } from "@/lib/sponsorship-records";
import type { ApprovedOrganization } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SponsorshipDeliverablesSection } from "./SponsorshipDeliverablesSection";
import { toast } from "sonner";

const tierStyle = (t: string) =>
  t === "Platinum"
    ? "bg-slate-800 text-white"
    : t === "Gold"
      ? "bg-amber-100 text-amber-900 border border-amber-200"
      : "bg-zinc-100 text-zinc-800";

const MATRIX_ROWS: { benefit: string; key: keyof import("@/lib/store").SponsorshipTierConfig | "speaking" | "newsletter" }[] = [
  { benefit: "Logo on website (homepage & exhibitors page)", key: "homepageFeature" },
  { benefit: "Brochure uploads", key: "brochureSlots" },
  { benefit: "Staff passes included", key: "staffPasses" },
  { benefit: "Lead capture (QR scan)", key: "leadCapture" },
  { benefit: "Feature in newsletter / email to attendees", key: "newsletter" },
  { benefit: "Speaking opportunity", key: "speaking" },
];

function invoiceStatusLabel(status: string) {
  if (status === "paid") return { label: "Paid", className: "bg-green/15 text-green" };
  if (status === "issued" || status === "pending_payment") return { label: "Awaiting payment", className: "bg-amber-100 text-amber-800" };
  return { label: status, className: "bg-secondary" };
}

type Props = {
  org: ApprovedOrganization;
  mode: "exhibitor" | "admin";
  actorName?: string;
  onEdit?: () => void;
  onChanged?: () => void;
};

export function SponsorshipRecordPanel({ org, mode, actorName = "Admin", onEdit, onChanged }: Props) {
  const store = useStore();
  const app = store.organizationApplications.find((a) => a.id === org.applicationId);
  const tierName = org.sponsorshipTier ?? "Silver";
  const tier = store.sponsorshipTiers.find((t) => t.tier === tierName);
  const invoices = getInvoicesForOrg(org.id);
  const deliverables = getDeliverablesForOrg(org.id);
  const carouselPeers = getCarouselSponsorPeers({ highlightOrgId: org.id, tier: tierName, limit: 5 });

  return (
    <div className="space-y-8">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-40" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest text-gold">FR-5.1 · Sponsorship</span>
              <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", tierStyle(tierName))}>
                {tierName}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">{org.name}</h1>
            <p className="text-white/85 text-sm mt-2">
              {mode === "admin" ? "Admin sponsorship record" : "Your sponsorship package"} · booth {org.booth}
              {org.sponsorshipContractRef ? ` · contract ${org.sponsorshipContractRef}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {app?.status === "approved" && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-green/30 text-white">
                <CheckCircle2 className="h-3.5 w-3.5" /> Application approved
              </span>
            )}
            {mode === "admin" && onEdit && (
              <Button type="button" size="sm" variant="secondary" className="bg-white/15 text-white border-white/30 hover:bg-white/25" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit record
              </Button>
            )}
          </div>
        </div>
      </div>

      {mode === "admin" && (
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm rounded-2xl border bg-card p-5">
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Contact</dt>
            <dd className="font-medium mt-1">{org.contact}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Speaking slot</dt>
            <dd className="font-medium mt-1">{org.speakingSlot ?? "Not assigned"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Paid through</dt>
            <dd className="font-medium mt-1">{org.sponsorshipPaidThrough ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Participation</dt>
            <dd className="font-medium mt-1 capitalize">{org.participation}</dd>
          </div>
        </dl>
      )}

      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="font-serif font-bold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          Sponsorship fee & invoices
        </h2>
        <p className="text-sm text-muted-foreground">
          Proforma invoices are issued when the secretariat approves the application (FR-5.1, FR-2.6).
        </p>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-4">No invoices on file yet.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const st = invoiceStatusLabel(inv.status);
              return (
                <div key={inv.id} className="rounded-xl border p-4 sm:p-5">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <div className="font-mono font-bold text-lg">{inv.reference}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {inv.type === "proforma" ? "Proforma invoice" : "Receipt"} · issued{" "}
                        {new Date(inv.issuedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full h-fit", st.className)}>
                        {st.label}
                      </span>
                      {mode === "admin" && inv.status !== "paid" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markInvoicePaid(inv.id, actorName);
                            toast.success("Payment recorded");
                            onChanged?.();
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark paid
                        </Button>
                      )}
                    </div>
                  </div>
                  <dl className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Amount (USD)</dt>
                      <dd className="font-mono font-bold">${inv.amountUsd.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Amount (RWF)</dt>
                      <dd className="font-mono font-bold">RWF {inv.amountRwf.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Due date</dt>
                      <dd className="font-medium">{inv.dueDate}</dd>
                    </div>
                  </dl>
                  {inv.paidAt && (
                    <p className="text-xs text-green mt-3 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Paid {new Date(inv.paidAt).toLocaleDateString("en-GB")} via {inv.paymentMethod ?? "confirmed transfer"}
                    </p>
                  )}
                  {inv.status !== "paid" && mode === "exhibitor" && (
                    <p className="text-xs mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-950">
                      Bank transfer to NAS 2026 — use reference <strong>{inv.reference}</strong> on your payment.
                    </p>
                  )}
                  {inv.notes && <p className="text-xs text-muted-foreground mt-2">{inv.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
        {app?.paymentStatus === "paid" && (
          <p className="text-sm text-green flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Application payment status: paid
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold text-lg mb-2">Tier benefits</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Values from <strong>Admin → Exhibitors → Tier benefits</strong> (SRS appendix matrix).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[320px]">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b">
                <th className="text-left py-2 pr-4">Benefit</th>
                <th className="text-left py-2">Package</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((row) => {
                let value = "—";
                if (row.key === "brochureSlots" && tier) value = `${tier.brochureSlots} files`;
                if (row.key === "staffPasses" && tier) value = `${tier.staffPasses} passes`;
                if (row.key === "leadCapture" && tier) value = tier.leadCapture ? "Yes" : "No";
                if (row.key === "homepageFeature" && tier) value = tier.homepageFeature ? "Yes (carousel)" : "Exhibitors page";
                if (row.key === "newsletter" && tier) value = tier.benefits.some((b) => b.toLowerCase().includes("newsletter")) ? "Yes" : "No";
                if (row.key === "speaking") value = org.speakingSlot ?? "Per committee assignment";
                return (
                  <tr key={row.benefit} className="border-b border-border/60">
                    <td className="py-3 pr-4 text-muted-foreground">{row.benefit}</td>
                    <td className="py-3 font-medium">{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {tier?.benefits.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      </div>

      <SponsorshipDeliverablesSection
        orgId={org.id}
        deliverables={deliverables}
        mode={mode}
        actorName={actorName}
        onChanged={onChanged}
      />

      {mode === "exhibitor" && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-serif font-bold flex items-center gap-2 mb-2">
                <Store className="h-4 w-4 text-accent" /> Branding & booth (FR-5.2)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload logo, profile, and website in Booth profile.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/exhibitor/booth">Edit booth profile</Link>
              </Button>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-serif font-bold flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-accent" /> Brochures
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Up to {tier?.brochureSlots ?? 1} PDF brochures for the exhibitor directory.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/exhibitor/materials">Manage brochures</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-serif font-bold text-lg flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-accent" /> Performance (FR-5.3)
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-secondary/40 p-4">
                <div className="font-serif text-2xl font-bold">{org.profileViews}</div>
                <div className="text-xs text-muted-foreground mt-1">Profile views</div>
              </div>
              <div className="rounded-xl bg-secondary/40 p-4">
                <div className="font-serif text-2xl font-bold">{org.brochureDownloads}</div>
                <div className="text-xs text-muted-foreground mt-1">Brochure downloads</div>
              </div>
              <div className="rounded-xl bg-secondary/40 p-4">
                <div className="font-serif text-2xl font-bold flex items-center justify-center gap-1">
                  <Users className="h-5 w-5 text-accent" />
                  {org.leads}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Leads captured</div>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link href="/exhibitor/analytics">Full analytics</Link>
            </Button>
          </div>
        </>
      )}

      {mode === "admin" && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-secondary/40 p-4 text-center">
            <div className="font-serif text-2xl font-bold">{org.profileViews}</div>
            <div className="text-xs text-muted-foreground mt-1">Profile views</div>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4 text-center">
            <div className="font-serif text-2xl font-bold">{org.brochureDownloads}</div>
            <div className="text-xs text-muted-foreground mt-1">Brochure downloads</div>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4 text-center">
            <div className="font-serif text-2xl font-bold">{org.leads}</div>
            <div className="text-xs text-muted-foreground mt-1">Leads captured</div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold text-lg mb-2">Public homepage preview (FR-1.1)</h2>
        <p className="text-xs text-muted-foreground mb-4">Sponsor logos from approved organizations on nas2026.rw.</p>
        <div className="rounded-xl gradient-navy text-white p-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto justify-center pb-1">
            {carouselPeers.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-3 text-center min-w-[100px] border",
                  s.isYou ? "border-gold bg-white/15 ring-2 ring-gold" : "border-white/20 bg-white/5",
                )}
              >
                <div className="text-xs font-bold truncate">{s.name}</div>
                <div className="text-[10px] opacity-70">{s.tier}</div>
              </div>
            ))}
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link href="/exhibitors" target="_blank">
            Public exhibitors page <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-secondary/30 p-4 text-sm flex gap-3">
        <Mail className="h-4 w-4 shrink-0 text-accent" />
        <p>
          Sponsorship questions:{" "}
          <a href="mailto:sponsorship@nas2026.rw" className="text-accent font-medium hover:underline">
            sponsorship@nas2026.rw
          </a>
          {mode === "exhibitor" && ". Invoice changes are confirmed by the Finance Officer after admin approval."}
        </p>
      </div>
    </div>
  );
}
