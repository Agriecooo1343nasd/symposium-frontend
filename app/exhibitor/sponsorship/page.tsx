"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExhibitorProfile, useLinkedSponsor } from "@/hooks/api/useExhibitor";
import { exhibitorDisplayName } from "@/lib/exhibitor/participation";

export default function Page() {
  const { profile, participation, isLoading } = useExhibitorProfile();
  const { sponsor, isLoading: sponsorLoading } = useLinkedSponsor(profile?.sponsorId);
  const isSponsor = participation === "sponsor" || participation === "both";

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">Exhibitor profile not found.</p>;
  }

  if (!isSponsor) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="font-serif text-3xl font-bold">Become a sponsor</h1>
        <p className="text-muted-foreground">
          Sponsorship is linked to your exhibitor record by the secretariat. There is no self-service sponsor purchase
          API yet — contact the team or submit an exhibitor application with sponsorship interest.
        </p>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <p className="text-sm">
            Current package: <strong>{profile.package?.name ?? "Exhibitor"}</strong>
            {profile.boothNumber ? ` · Booth ${profile.boothNumber}` : ""}
          </p>
          <Button asChild className="gradient-blue text-accent-foreground">
            <Link href="/dashboard/apply">Apply / upgrade via dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact secretariat</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-accent" /> Sponsorship
        </h1>
        <p className="text-muted-foreground mt-1">
          {exhibitorDisplayName(profile)}
          {participation === "both" ? " — exhibitor and sponsor" : " — sponsor"}
        </p>
      </div>

      {sponsorLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : sponsor ? (
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex flex-wrap items-start gap-4">
            {sponsor.logoUrl && (
              <img src={sponsor.logoUrl} alt="" className="h-16 w-auto object-contain rounded-lg border p-2 bg-white" />
            )}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{sponsor.tier}</div>
              <h2 className="font-serif text-2xl font-bold">{sponsor.name}</h2>
              {sponsor.websiteUrl && (
                <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
                  {sponsor.websiteUrl}
                </a>
              )}
            </div>
          </div>
          {sponsor.description && <p className="text-sm text-muted-foreground">{sponsor.description}</p>}
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green" /> Listed on public sponsor wall
            </li>
            {profile.boothNumber && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green" /> Booth {profile.boothNumber}
              </li>
            )}
            {profile.package && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green" /> Package: {profile.package.name}
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm">
          <p className="font-semibold text-amber-950">Sponsor record linked</p>
          <p className="mt-1 text-amber-900">
            Your profile references sponsor <strong>{profile.sponsorName ?? profile.sponsorId}</strong>. Full sponsor
            details (logo, tier, benefits) are loaded from the public sponsors list when published.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Invoices & deliverables</p>
        <p>
          Sponsorship invoices, payment status, and deliverable checklists are not available via API yet. The secretariat
          manages these offline — see ai/reports.txt (S7).
        </p>
      </div>
    </div>
  );
}
