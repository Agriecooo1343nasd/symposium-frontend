"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Clock, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useExhibitorProfile,
  useLinkedSponsor,
  useMySponsorProfile,
  useMySponsorInvoice,
  useSponsorshipTierPricing,
} from "@/hooks/api/useExhibitor";
import { useSymposium } from "@/hooks/api/useSymposium";
import { exhibitorDisplayName } from "@/lib/exhibitor/participation";
import { BecomeSponsorDialog } from "@/components/exhibitor/BecomeSponsorDialog";

export default function Page() {
  const { symposiumId } = useSymposium();
  const { profile, participation, isLoading } = useExhibitorProfile();
  const { sponsor: linkedSponsor, isLoading: linkedSponsorLoading } = useLinkedSponsor(profile?.sponsorId);
  const { sponsor: mySponsor, isLoading: mySponsorLoading } = useMySponsorProfile();
  const { invoice, isLoading: invoiceLoading } = useMySponsorInvoice();
  const { pricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const isSponsor = participation === "sponsor" || participation === "both";
  const hasBooth = Boolean(profile?.boothNumber || profile?.packageId || profile?.package);
  
  // Use the sponsor profile from the new API if available, otherwise fall back to linked sponsor
  const sponsor = mySponsor || linkedSponsor;
  const sponsorLoading = mySponsorLoading || linkedSponsorLoading;

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
        <div>
          <h1 className="font-serif text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-accent" /> Become a sponsor
          </h1>
          <p className="text-muted-foreground mt-1">
            Amplify your presence at the symposium. Sponsorship adds brand visibility on top of your exhibitor booth —
            apply below and the secretariat will review your request and issue a proforma invoice on approval.
          </p>
        </div>

        {applied ? (
          <div className="rounded-2xl border border-green/30 bg-green/5 p-6 space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-green" /> Application submitted
            </p>
            <p className="text-sm text-muted-foreground">
              Your sponsorship application is under review. You&apos;ll receive a proforma invoice here once it&apos;s
              approved. This page will show your sponsor details as soon as the secretariat activates them.
            </p>
            <Button variant="outline" size="sm" onClick={() => setApplied(false)}>
              Submit another request
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <p className="text-sm">
              Current participation: <strong>{profile.package?.name ?? "Exhibitor"}</strong>
              {profile.boothNumber ? ` · Booth ${profile.boothNumber}` : ""}
            </p>

            {pricing.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {pricing.map((t) => (
                  <div key={t.tier} className="rounded-xl border bg-secondary/30 p-4">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground capitalize">
                      {t.tier}
                    </div>
                    <div className="font-serif text-xl font-bold mt-1">${t.amountUsd.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.amountRwf ? `≈ RWF ${t.amountRwf.toLocaleString()}` : "\u00A0"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button className="gradient-blue text-accent-foreground" onClick={() => setApplyOpen(true)}>
                Apply for sponsorship
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact secretariat</Link>
              </Button>
            </div>
          </div>
        )}

        <BecomeSponsorDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          profile={profile}
          hasBooth={hasBooth}
          onSubmitted={() => setApplied(true)}
        />
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

      <div className="rounded-2xl border border-dashed p-6 text-sm">
        <p className="font-medium text-foreground mb-2">Proforma invoice</p>
        {invoiceLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : invoice ? (
          <div className="space-y-2 text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">{invoice.invoiceNumber}</span>
              {" · "}
              {invoice.currency} {invoice.amount.toLocaleString()}
              {" · "}
              <span className="capitalize">{invoice.status}</span>
            </p>
            {invoice.paymentInstructions && (
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{invoice.paymentInstructions}</p>
            )}
            {invoice.paidAt && (
              <p className="text-xs text-green">Paid {new Date(invoice.paidAt).toLocaleDateString()}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No invoice on file yet. The secretariat issues a proforma invoice after your sponsorship application is approved.
          </p>
        )}
      </div>
    </div>
  );
}
