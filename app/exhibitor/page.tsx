"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Store,
  Calendar,
  MapPin,
  CheckCircle2,
  Circle,
  ScanLine,
  Sparkles,
  ArrowRight,
  FileText,
  IdCard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/layout/PortalShell";
import { useExhibitorMaterials, useExhibitorProfile, useExhibitorStaffPasses, useLinkedSponsor } from "@/hooks/api/useExhibitor";
import { useSymposium } from "@/hooks/api/useSymposium";
import { exhibitorDisplayName, staffPassQuota } from "@/lib/exhibitor/participation";
import { loadExhibitorLeads } from "@/lib/exhibitor/leads-storage";
import { cn } from "@/lib/utils";

const tierBadge = (t: string) =>
  t === "Platinum"
    ? "bg-slate-100 text-slate-900"
    : t === "Gold"
      ? "bg-amber-100 text-amber-900"
      : "bg-zinc-100 text-zinc-900";

function HeroBanner({
  participation,
  companyName,
  boothNumber,
  tierName,
  venue,
  dates,
}: {
  participation: "exhibitor" | "sponsor" | "both";
  companyName: string;
  boothNumber?: string | null;
  tierName?: string | null;
  venue?: string | null;
  dates?: string | null;
}) {
  const label =
    participation === "sponsor" ? "Sponsor" : participation === "both" ? "Exhibitor + Sponsor" : "Exhibitor";

  return (
    <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 leaf-texture opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs uppercase tracking-widest text-gold">{label}</span>
          {participation !== "exhibitor" && tierName && (
            <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", tierBadge(tierName))}>
              {tierName}
            </span>
          )}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">{companyName}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/85">
          {boothNumber && (
            <span className="inline-flex items-center gap-1.5">
              <Store className="h-4 w-4 text-gold" /> Booth {boothNumber}
            </span>
          )}
          {dates && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold" /> {dates}
            </span>
          )}
          {venue && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold" /> {venue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { symposium } = useSymposium();
  const { profile, participation, isSponsor, isLoading, isError } = useExhibitorProfile();
  const { sponsor } = useLinkedSponsor(profile?.sponsorId);
  const { materials } = useExhibitorMaterials();
  const { passes } = useExhibitorStaffPasses();

  const leads = useMemo(() => (profile ? loadExhibitorLeads(profile.id) : []), [profile?.id]);

  const quota = staffPassQuota(profile);
  const companyName = exhibitorDisplayName(profile);
  const tierName = sponsor?.tier ?? null;
  const dates =
    symposium?.startDate && symposium?.endDate
      ? `${new Date(symposium.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${new Date(symposium.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading exhibitor profile…
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm max-w-xl space-y-3">
        <p className="font-semibold text-amber-950">No exhibitor profile linked yet</p>
        <p className="text-amber-900">
          Your account has exhibitor access, but it isn&apos;t connected to an exhibitor booth record yet. This is
          normal right after a sponsorship or exhibitor application is approved — the secretariat provisions your booth
          shortly after.
        </p>
        <ul className="list-disc pl-5 text-amber-900 space-y-1">
          <li>If you just applied, please allow the secretariat time to set up your booth.</li>
          <li>Haven&apos;t applied yet? Submit an exhibitor/sponsor application below.</li>
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm" className="gradient-blue text-accent-foreground">
            <Link href="/dashboard/apply-exhibit">Apply to exhibit / sponsor</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/contact">Contact secretariat</Link>
          </Button>
        </div>
      </div>
    );
  }

  const checklist = [
    { label: "Company name set", done: Boolean(profile.companyName) },
    { label: "Booth number assigned", done: Boolean(profile.boothNumber) },
    { label: "Brochures uploaded", done: materials.length > 0 },
    { label: `Staff passes (${passes.length}/${quota})`, done: passes.length > 0 },
    ...(isSponsor ? [{ label: "Sponsor linked", done: Boolean(profile.sponsorId) }] : []),
  ];
  const done = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-8">
      <HeroBanner
        participation={participation}
        companyName={companyName}
        boothNumber={profile.boothNumber}
        tierName={tierName}
        venue={symposium?.venue ?? symposium?.city}
        dates={dates}
      />

      <div className={cn("grid gap-4", isSponsor ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3")}>
        <StatTile label="Brochures" value={materials.length} hint={`of ${profile.package?.name ?? "package"}`} accent />
        <StatTile label="Leads captured" value={leads.length} hint="this device" />
        <StatTile label="Staff passes" value={`${passes.length}/${quota}`} />
        {isSponsor && <StatTile label="Sponsor tier" value={tierName ?? "Linked"} />}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-bold">Booth readiness</h2>
            <span className="text-xs text-muted-foreground">
              {done}/{checklist.length} complete
            </span>
          </div>
          <ul className="space-y-2 text-sm mb-4">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
              </li>
            ))}
          </ul>
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
            {leads.length > 0
              ? `${leads.length} lead(s) captured on this device from badge scans.`
              : "Scan attendee e-ticket QR codes at your booth to build a leads list."}
          </p>
          <Button asChild size="sm" className="gradient-blue text-accent-foreground mt-4">
            <Link href="/exhibitor/leads">Manage leads</Link>
          </Button>
        </div>
      </div>

      {isSponsor && sponsor && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-serif font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" /> Sponsorship — {sponsor.tier}
          </h2>
          {sponsor.description && <p className="text-sm text-muted-foreground mb-4">{sponsor.description}</p>}
          <Button asChild size="sm" className="gradient-blue text-accent-foreground">
            <Link href="/exhibitor/sponsorship">Sponsorship hub</Link>
          </Button>
        </div>
      )}

      {!isSponsor && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <h3 className="font-serif font-bold text-amber-900">Become a sponsor</h3>
          <p className="text-sm text-amber-800 mt-1">
            Add sponsorship to your exhibitor package for homepage visibility and extra benefits.
          </p>
          <Button asChild size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/exhibitor/sponsorship">
              View sponsorship <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/exhibitor/materials", icon: FileText, label: "Brochures" },
          { to: "/exhibitor/passes", icon: IdCard, label: "Staff passes" },
          { to: "/exhibitor/leads", icon: ScanLine, label: "Leads" },
          ...(isSponsor
            ? [{ to: "/exhibitor/sponsorship", icon: Sparkles, label: "Sponsorship" }]
            : [{ to: "/exhibitor/booth", icon: Store, label: "Booth profile" }]),
        ].map((c) => (
          <Link
            key={c.to}
            href={c.to}
            className="rounded-xl bg-card border border-border p-4 hover-lift flex items-center gap-3"
          >
            <c.icon className="h-4 w-4 text-accent flex-shrink-0" />
            <span className="text-sm font-medium">{c.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
