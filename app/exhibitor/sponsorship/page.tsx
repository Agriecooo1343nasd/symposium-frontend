"use client";

import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  ExternalLink,
  Store,
  Users,
  Download,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getExhibitorOrgId } from "@/lib/store";
import { getInvoicesForOrg } from "@/lib/sponsorship-invoices";
import { EXHIBITOR_ME, SPONSORS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";


const tierStyle = (t: string) =>
  t === "Platinum"
    ? "bg-slate-800 text-white"
    : t === "Gold"
      ? "bg-amber-100 text-amber-900 border border-amber-200"
      : "bg-zinc-100 text-zinc-800";

/** SRS Appendix — tier benefit matrix (enforced by admin-configured tiers in store). */
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

export default function Page() {
  const store = useStore();
  const orgId = getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const app = store.organizationApplications.find((a) => a.id === org?.applicationId);
  const isSponsor = org?.participation === "sponsor" || org?.participation === "both";
  const tierName = org?.sponsorshipTier ?? EXHIBITOR_ME.tier;
  const tier = store.sponsorshipTiers.find((t) => t.tier === tierName);
  const invoices = getInvoicesForOrg(orgId);

  const carouselPeers = [
    { id: "you", name: org?.name ?? EXHIBITOR_ME.name, tier: tierName },
    ...SPONSORS.filter((s) => s.tier === tierName || s.tier === "Platinum").slice(0, 4),
  ];

  if (!isSponsor) {
    return (
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Become a sponsor</h1>
          <p className="text-muted-foreground">
            FR-5.1 — Your booth package is exhibitor-only. Apply for Platinum, Gold, or Silver sponsorship via the attendee
            dashboard; the secretariat reviews and issues an invoice for the sponsorship fee.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {store.sponsorshipTiers.map((t) => (
            <div key={t.tier} className={cn("rounded-2xl border p-5", t.tier === "Gold" && "border-accent shadow-md")}>
              <div className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-3", tierStyle(t.tier))}>
                {t.tier}
              </div>
              <div className="font-serif text-2xl font-bold">${t.baseFeeUsd.toLocaleString()}</div>
              <ul className="mt-4 space-y-2 text-sm">
                {t.benefits.map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Button asChild className="gradient-blue text-accent-foreground">
          <Link href="/dashboard/apply">Apply for sponsorship</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-40" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-widest text-gold">FR-5.1 · Sponsorship</span>
              <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", tierStyle(tierName))}>
                {tierName}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">{org?.name}</h1>
            <p className="text-white/85 text-sm mt-2 max-w-xl">
              Admin-approved {tierName} package · booth {org?.booth}. Benefits below are set by the organizing committee
              in the admin tier editor (SRS appendix matrix).
            </p>
          </div>
          {app?.status === "approved" && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-green/30 text-white">
              <CheckCircle2 className="h-3.5 w-3.5" /> Application approved
            </span>
          )}
        </div>
      </div>

      {/* FR-5.1 — invoice tracking (admin issues on approve) */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="font-serif font-bold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          Sponsorship fee & invoices
        </h2>
        <p className="text-sm text-muted-foreground">
          When the secretariat approves your application, a <strong>proforma invoice</strong> is generated for the
          sponsorship fee (FR-5.1, FR-2.6). Pay via bank transfer; finance confirms payment in the system.
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
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full h-fit", st.className)}>
                      {st.label}
                    </span>
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
                  {inv.status !== "paid" && (
                    <p className="text-xs mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-950">
                      Bank transfer to NAS 2026 — use reference <strong>{inv.reference}</strong> on your payment. Portal
                      benefits activate when finance marks the invoice paid.
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
            <CheckCircle2 className="h-4 w-4" /> Application payment status: paid — full portal access enabled.
          </p>
        )}
      </div>

      {/* Appendix benefit matrix vs configured tier */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold text-lg mb-2">Your tier benefits</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Matches the SRS appendix matrix — values come from <strong>Admin → Exhibitors → Tier benefits</strong>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b">
                <th className="text-left py-2 pr-4">Benefit</th>
                <th className="text-left py-2">Your package</th>
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
                if (row.key === "speaking") value = org?.speakingSlot ?? "Per committee assignment";
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

      {/* FR-5.2 branding assets — exhibitor manages */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-serif font-bold flex items-center gap-2 mb-2">
            <Store className="h-4 w-4 text-accent" /> Branding & booth (FR-5.2)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            You upload logo, profile, and website in Booth profile. Secretariat places approved assets on the public site
            and print materials.
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
            Up to {tier?.brochureSlots ?? 3} PDF brochures for the exhibitor directory (FR-5.2).
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/exhibitor/materials">Manage brochures</Link>
          </Button>
        </div>
      </div>

      {/* FR-5.3 analytics */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold text-lg flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-accent" /> Performance (FR-5.3)
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-secondary/40 p-4">
            <div className="font-serif text-2xl font-bold">{org?.profileViews ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Profile views</div>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4">
            <div className="font-serif text-2xl font-bold">{org?.brochureDownloads ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Brochure downloads</div>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4">
            <div className="font-serif text-2xl font-bold flex items-center justify-center gap-1">
              <Users className="h-5 w-5 text-accent" />
              {org?.leads ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Leads captured</div>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link href="/exhibitor/analytics">Full analytics</Link>
        </Button>
      </div>

      {/* FR-1.1 homepage carousel preview */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-serif font-bold text-lg mb-2">Public homepage preview (FR-1.1)</h2>
        <p className="text-xs text-muted-foreground mb-4">How sponsor logos appear on nas2026.rw after secretariat publishes your assets.</p>
        <div className="rounded-xl gradient-navy text-white p-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto justify-center pb-1">
            {carouselPeers.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-3 text-center min-w-[100px] border",
                  s.id === "you" ? "border-gold bg-white/15 ring-2 ring-gold" : "border-white/20 bg-white/5",
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
          . Invoice changes are made by the <strong>Finance Officer</strong> after admin approval.
        </p>
      </div>
    </div>
  );
}
