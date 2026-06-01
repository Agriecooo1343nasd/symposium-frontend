"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Store, Calendar, MapPin, CheckCircle2, Circle, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/layout/PortalShell";
import { EVENT } from "@/lib/mock-data";
import { useStore } from "@/hooks/use-store";
import { getExhibitorOrgId } from "@/lib/store";
import { getLeadAnalytics, exhibitorHasLeadCapture } from "@/lib/lead-capture";


const tierColor = (t: string) =>
  t === "Platinum" ? "bg-slate-100 text-slate-900" : t === "Gold" ? "bg-amber-100 text-amber-900" : "bg-zinc-100 text-zinc-900";

export default function Page() {
  const store = useStore();
  const orgId = getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const tier = org?.sponsorshipTier ?? "Gold";
  const hasLeads = exhibitorHasLeadCapture(orgId);
  const analytics = useMemo(() => getLeadAnalytics(orgId), [store.exhibitorLeads, orgId]);

  const staff = store.exhibitorStaff.filter((s) => s.orgId === orgId);
  const confirmedStaff = staff.filter((s) => s.status === "Confirmed").length;
  const brochureCount = 2;

  const CHECKLIST = [
    { label: "Company profile complete", done: true },
    { label: "Logo uploaded", done: true },
    { label: `Brochures uploaded (${brochureCount}/3)`, done: brochureCount >= 3 },
    { label: `Staff passes assigned (${confirmedStaff}/${staff.length || 4})`, done: confirmedStaff >= 2 },
    { label: "Booth confirmed", done: !!org?.booth },
  ];

  const done = CHECKLIST.filter((c) => c.done).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-xs uppercase tracking-widest text-gold">Exhibitor</div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(tier)}`}>{tier}</span>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Profile views" value={142} hint="last 7 days" trend="+18%" accent />
        <StatTile
          label="Leads captured"
          value={analytics.total}
          hint={hasLeads ? "QR badge scans" : "upgrade for capture"}
          trend={hasLeads ? analytics.topInterest : undefined}
        />
        <StatTile label="Brochure downloads" value={60} />
        <StatTile label="Staff passes" value={`${confirmedStaff}/${staff.length || 4}`} hint="confirmed / total" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-bold">Package summary — {tier}</h2>
            <span className="text-xs text-muted-foreground">
              {done}/{CHECKLIST.length} complete
            </span>
          </div>
          <ul className="space-y-2 text-sm mb-4">
            {CHECKLIST.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
              </li>
            ))}
          </ul>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
            <div className="h-full gradient-blue" style={{ width: `${(done / CHECKLIST.length) * 100}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/exhibitor/booth">Edit profile</Link>
            </Button>
            <Button asChild className="gradient-blue text-accent-foreground" size="sm">
              <Link href="/exhibitor/materials">Upload brochures</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-accent/10 border border-accent/30 p-6">
          <div className="text-xs uppercase tracking-wider text-accent font-semibold flex items-center gap-1">
            <ScanLine className="h-3.5 w-3.5" /> Lead capture
          </div>
          <p className="text-sm mt-2 leading-relaxed">
            {hasLeads
              ? `You have ${analytics.total} leads from badge scans. Top interest: ${analytics.topInterest}. Scan visitors at booth ${org?.booth} and add booth notes for follow-up.`
              : "Upgrade to Gold or Platinum to scan attendee e-tickets and build your CRM."}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild size="sm" className="gradient-blue text-accent-foreground">
              <Link href="/exhibitor/leads">{hasLeads ? "Scan & manage leads" : "View packages"}</Link>
            </Button>
            {hasLeads && (
              <Button asChild size="sm" variant="outline">
                <Link href="/exhibitor/analytics">Analytics</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
