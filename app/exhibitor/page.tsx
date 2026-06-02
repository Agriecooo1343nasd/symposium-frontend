"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Store, Calendar, MapPin, CheckCircle2, Circle,
  ScanLine, Sparkles, ArrowRight, FileText, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/layout/PortalShell";
import { EVENT } from "@/lib/mock-data";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { getExhibitorOrgId } from "@/lib/store";
import { getLeadAnalytics, exhibitorHasLeadCapture } from "@/lib/lead-capture";
import { getInvoicesForOrg } from "@/lib/sponsorship-invoices";
import { cn } from "@/lib/utils";

const tierBadge = (t: string) =>
  t === "Platinum" ? "bg-slate-100 text-slate-900"
    : t === "Gold" ? "bg-amber-100 text-amber-900"
      : "bg-zinc-100 text-zinc-900";

// Stats row — adapts based on whether sponsor invoice tile is needed
function StatsRow({ orgId, isSponsor }: { orgId: string; isSponsor: boolean }) {
  const store = useStore();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const tierCfg = store.sponsorshipTiers.find((t) => t.tier === (org?.sponsorshipTier ?? "Silver"));
  const hasLeads = exhibitorHasLeadCapture(orgId);
  const analytics = useMemo(() => getLeadAnalytics(orgId), [store.exhibitorLeads, orgId]);
  const staff = store.exhibitorStaff.filter((s) => s.orgId === orgId);
  const confirmedStaff = staff.filter((s) => s.status === "Confirmed").length;
  const invoices = getInvoicesForOrg(orgId);
  const unpaid = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");

  return (
    <div className={cn("grid gap-4", isSponsor ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4")}>
      <StatTile label="Profile views" value={org?.profileViews ?? 142} hint="public directory" trend="+12%" accent />
      <StatTile label="Leads captured" value={analytics.total} hint={hasLeads ? "QR scans" : "Gold/Platinum only"} />
      <StatTile label="Brochure downloads" value={org?.brochureDownloads ?? 60} />
      <StatTile label="Staff passes" value={`${confirmedStaff}/${tierCfg?.staffPasses ?? 4}`} hint="confirmed / quota" />
      {isSponsor && (
        <StatTile
          label="Invoices"
          value={unpaid.length === 0 ? "Paid" : `${unpaid.length} due`}
          hint={unpaid.length > 0 ? "action needed" : "settled"}
        />
      )}
    </div>
  );
}

// Booth readiness checklist + lead capture — shared by all participation types
function BoothPanel({ orgId }: { orgId: string }) {
  const store = useStore();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const hasLeads = exhibitorHasLeadCapture(orgId);
  const analytics = useMemo(() => getLeadAnalytics(orgId), [store.exhibitorLeads, orgId]);
  const staff = store.exhibitorStaff.filter((s) => s.orgId === orgId);
  const confirmedStaff = staff.filter((s) => s.status === "Confirmed").length;

  const checklist = [
    { label: "Company profile complete", done: !!org?.description },
    { label: "Logo uploaded", done: true },
    { label: "Brochures uploaded", done: false },
    { label: `Staff passes: ${confirmedStaff} confirmed`, done: confirmedStaff >= 1 },
    { label: "Booth confirmed", done: !!org?.booth },
  ];
  const done = checklist.filter((c) => c.done).length;

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-bold">Booth readiness</h2>
          <span className="text-xs text-muted-foreground">{done}/{checklist.length} complete</span>
        </div>
        <ul className="space-y-2 text-sm mb-4">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              {c.done
                ? <CheckCircle2 className="h-4 w-4 text-green flex-shrink-0" />
                : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
            </li>
          ))}
        </ul>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
          <div className="h-full gradient-blue" style={{ width: `${(done / checklist.length) * 100}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/exhibitor/booth">Edit profile</Link>
          </Button>
          <Button asChild size="sm" className="gradient-blue text-accent-foreground">
            <Link href="/exhibitor/materials">Brochures</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-accent/10 border border-accent/30 p-6">
        <div className="text-xs uppercase tracking-wider text-accent font-semibold flex items-center gap-1 mb-2">
          <ScanLine className="h-3.5 w-3.5" /> Lead capture
        </div>
        <p className="text-sm leading-relaxed">
          {hasLeads
            ? `${analytics.total} leads from badge scans. Top interest: ${analytics.topInterest}.`
            : "Gold and Platinum sponsors can scan attendee e-tickets to build a leads list."}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button asChild size="sm" className="gradient-blue text-accent-foreground">
            <Link href="/exhibitor/leads">{hasLeads ? "Manage leads" : "View details"}</Link>
          </Button>
          {hasLeads && (
            <Button asChild size="sm" variant="outline">
              <Link href="/exhibitor/analytics">Analytics</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hero banner — participation-aware ───────────────────────────────────────

function HeroBanner({
  orgId,
  participation,
}: {
  orgId: string;
  participation: "exhibitor" | "sponsor" | "both";
}) {
  const store = useStore();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const tierName = org?.sponsorshipTier ?? "Silver";

  const label =
    participation === "sponsor" ? "Sponsor" :
      participation === "both" ? "Exhibitor + Sponsor" :
        "Exhibitor";

  return (
    <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 leaf-texture opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          {participation !== "exhibitor" && <Sparkles className="h-4 w-4 text-gold" />}
          {participation === "exhibitor" && <Store className="h-4 w-4 text-gold" />}
          <span className="text-xs uppercase tracking-widest text-gold">{label}</span>
          {participation !== "exhibitor" && (
            <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", tierBadge(tierName))}>
              {tierName}
            </span>
          )}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">{org?.name ?? "Your organization"}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/85">
          <span className="inline-flex items-center gap-1.5">
            <Store className="h-4 w-4 text-gold" /> Booth {org?.booth ?? "—"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gold" /> 13–14 Aug 2026
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-gold" /> {EVENT.venue}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sponsor section (invoices + benefits) ────────────────────────────────────

function SponsorPanel({ orgId }: { orgId: string }) {
  const store = useStore();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const tierName = org?.sponsorshipTier ?? "Silver";
  const tierCfg = store.sponsorshipTiers.find((t) => t.tier === tierName);
  const invoices = getInvoicesForOrg(orgId);
  const unpaid = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");

  return (
    <div className={cn(
      "rounded-2xl border p-6",
      unpaid.length > 0 ? "bg-amber-50/60 border-amber-200" : "bg-card border-border",
    )}>
      <h2 className="font-serif font-bold mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" /> Sponsorship — {tierName}
      </h2>
      {unpaid.length > 0 && (
        <p className="text-sm text-amber-900 mb-3">
          {unpaid.length} invoice{unpaid.length > 1 ? "s" : ""} awaiting payment.
        </p>
      )}
      <ul className="space-y-1.5 text-sm mb-5">
        {(tierCfg?.benefits ?? []).slice(0, 5).map((b) => (
          <li key={b} className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-green flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
      <Button asChild size="sm" className="gradient-blue text-accent-foreground">
        <Link href="/exhibitor/sponsorship">Sponsorship hub</Link>
      </Button>
    </div>
  );
}

// ─── "Become a sponsor" CTA — only for exhibitor-only ─────────────────────────

function BecomeSponsorCTA() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-6 w-6 text-amber-700" />
      </div>
      <div className="flex-1">
        <h3 className="font-serif font-bold text-amber-900">Become a sponsor — amplify your reach</h3>
        <p className="text-sm text-amber-800 mt-1 leading-relaxed">
          Add Platinum, Gold, or Silver sponsorship to your exhibitor package. Get homepage logo placement,
          newsletter features, extra staff passes, and a speaking opportunity.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
          <Link href="/exhibitor/sponsorship">
            View packages <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
          <Link href="/dashboard/apply">Apply now</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Quick nav links ──────────────────────────────────────────────────────────

function QuickNav({ isSponsor }: { isSponsor: boolean }) {
  const links = [
    { to: "/exhibitor/materials", icon: FileText, label: "Brochures" },
    { to: "/exhibitor/passes", icon: Store, label: "Staff passes" },
    { to: "/exhibitor/analytics", icon: BarChart3, label: "Analytics" },
    ...(isSponsor
      ? [{ to: "/exhibitor/sponsorship", icon: Sparkles, label: "Sponsorship" }]
      : [{ to: "/exhibitor/location", icon: MapPin, label: "Booth info" }]),
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {links.map((c) => (
        <Link key={c.to} href={c.to}
          className="rounded-xl bg-card border border-border p-4 hover-lift flex items-center gap-3">
          <c.icon className="h-4 w-4 text-accent flex-shrink-0" />
          <span className="text-sm font-medium">{c.label}</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </Link>
      ))}
    </div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function Page() {
  const { session } = useAuth();
  const orgId = getExhibitorOrgId();
  const participation = (session?.participation ?? "exhibitor") as "exhibitor" | "sponsor" | "both";
  const isSponsor = participation === "sponsor" || participation === "both";

  return (
    <div className="space-y-8">
      <HeroBanner orgId={orgId} participation={participation} />
      <StatsRow orgId={orgId} isSponsor={isSponsor} />
      <BoothPanel orgId={orgId} />
      {isSponsor && <SponsorPanel orgId={orgId} />}
      {!isSponsor && <BecomeSponsorCTA />}
      <QuickNav isSponsor={isSponsor} />
    </div>
  );
}
