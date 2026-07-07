"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import {
  useCreateExhibitorApplication,
  useCreateSponsorshipApplication,
  usePublicExhibitorPackages,
  useSponsorshipTierPricing,
} from "@/hooks/api/useExhibitor";
import { useBooths } from "@/hooks/api/useBooths";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { BoothMapPicker, type PickerBooth } from "@/components/shared/BoothMapPicker";
import {
  buildApplicationMessage,
  calculatePackageEstimate,
  defaultTierFromPricing,
  sponsorshipWantsBooth,
  tierToApi,
  type ApplyParticipationType,
} from "@/lib/exhibitor-sponsor-apply";
import type { SponsorshipTier } from "@/lib/store";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export function ExhibitorSponsorApplyForm() {
  const router = useRouter();
  const { session } = useAuth();
  const { symposiumId } = useSymposium();
  const { packages, isLoading: packagesLoading } = usePublicExhibitorPackages(symposiumId || undefined);
  const { pricing: tierPricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const { booths } = useBooths(symposiumId);
  const createSponsorshipApplication = useCreateSponsorshipApplication();
  const createExhibitorApplication = useCreateExhibitorApplication();

  const [org, setOrg] = useState({
    companyName: "",
    description: "",
    contactName: session?.name ?? "",
    contactEmail: session?.email ?? "",
    contactPhone: "",
    participation: "exhibitor" as ApplyParticipationType,
    sponsorshipTier: "Silver" as SponsorshipTier,
    packageId: "" as string,
  });
  const [staffCount, setStaffCount] = useState(2);
  const [pickedBooth, setPickedBooth] = useState<PickerBooth | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activePackages = useMemo(() => packages.filter((p) => p.isActive), [packages]);
  const resolvedPackageId = org.packageId || activePackages[0]?.id || "";
  const isExhibitor = org.participation === "exhibitor";
  const isSponsor = org.participation === "sponsor";

  useEffect(() => {
    if (!tierPricing.length) return;
    setOrg((prev) => ({
      ...prev,
      sponsorshipTier: defaultTierFromPricing(tierPricing, prev.sponsorshipTier),
    }));
  }, [tierPricing]);

  useEffect(() => {
    if (!activePackages.length) return;
    setOrg((prev) => (prev.packageId ? prev : { ...prev, packageId: activePackages[0].id }));
  }, [activePackages]);

  const quote = calculatePackageEstimate({
    participation: org.participation,
    tier: org.sponsorshipTier,
    staffCount,
    packages: activePackages,
    tierPricing,
    selectedPackageId: resolvedPackageId,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId) return toast.error("Symposium not loaded — please retry.");
    if (!org.companyName.trim()) return toast.error("Company name is required.");
    if (!org.contactName.trim()) return toast.error("Contact name is required.");
    if (!org.contactEmail.trim()) return toast.error("Contact email is required.");
    if (!org.description.trim()) return toast.error("Description is required.");

    if (isExhibitor && !resolvedPackageId) {
      return toast.error("Select an exhibitor package — none are published yet.");
    }
    if (isSponsor && tierPricing.length === 0) {
      return toast.error("Sponsorship tier pricing is not configured yet.");
    }

    const selectedPackage = activePackages.find((p) => p.id === resolvedPackageId);
    const meta = {
      participationType: org.participation,
      packageId: isExhibitor ? resolvedPackageId : undefined,
      packageName: isExhibitor ? selectedPackage?.name : undefined,
      preferredBoothId: pickedBooth?.id,
      preferredBoothCode: pickedBooth?.code,
      staffCount,
      quotedFeeUsd: quote.feeUsd,
      quotedFeeRwf: quote.feeRwf,
    };
    const message = buildApplicationMessage(org.description.trim(), meta);

    try {
      setSubmitting(true);

      if (isExhibitor) {
        await createExhibitorApplication.mutateAsync({
          symposiumId,
          organizationName: org.companyName.trim(),
          contactName: org.contactName.trim(),
          contactEmail: org.contactEmail.trim(),
          contactPhone: org.contactPhone.trim() || undefined,
          packageId: resolvedPackageId,
          message,
          preferredBoothId: pickedBooth?.id,
          staffCount,
          quotedFeeUsd: quote.feeUsd,
        });
        toast.success("Exhibitor application submitted");
      } else {
        await createSponsorshipApplication.mutateAsync({
          symposiumId,
          organizationName: org.companyName.trim(),
          contactName: org.contactName.trim(),
          contactEmail: org.contactEmail.trim(),
          contactPhone: org.contactPhone.trim(),
          desiredTier: tierToApi(org.sponsorshipTier),
          message,
          wantsExhibitorBooth: sponsorshipWantsBooth(org.participation),
        });
        toast.success("Sponsorship application submitted");
      }

      router.push("/dashboard");
    } catch (err) {
      const msg = apiErrorMessage(err);
      if (isExhibitor && (msg.includes("404") || msg.toLowerCase().includes("not found"))) {
        toast.error("Exhibitor apply API is not live yet — ask the backend team to ship POST /exhibitor-applications.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl bg-card border border-border p-6">
        {packagesLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading packages…
          </div>
        ) : (
          <ExhibitorPackageEstimator
            participation={org.participation}
            tier={org.sponsorshipTier}
            staffCount={staffCount}
            onStaffCountChange={setStaffCount}
            packages={activePackages}
            tierPricing={tierPricing}
            selectedPackageId={resolvedPackageId}
          />
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-serif font-bold">Application type</h2>
        <div>
          <Label>I want to apply as *</Label>
          <Select
            value={org.participation}
            onValueChange={(v) => setOrg({ ...org, participation: v as ApplyParticipationType })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose exhibitor or sponsor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exhibitor">Exhibitor — booth package on the floor</SelectItem>
              <SelectItem value="sponsor">Sponsor — Platinum / Gold / Silver (booth included)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Pick one path per application. Applying is free — after admin approval you receive an invoice (FR-5.1).
          </p>
        </div>

        {isExhibitor && (
          <div>
            <Label>Exhibitor booth package *</Label>
            <Select
              value={resolvedPackageId}
              onValueChange={(v) => setOrg({ ...org, packageId: v })}
              disabled={!activePackages.length}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={activePackages.length ? "Select a booth package" : "No packages published yet"} />
              </SelectTrigger>
              <SelectContent>
                {activePackages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ${Number(p.priceUsd).toLocaleString()} · {p.staffPassQuota} staff passes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isSponsor && (
          <div>
            <Label>Sponsorship tier *</Label>
            <Select
              value={org.sponsorshipTier}
              onValueChange={(v) => setOrg({ ...org, sponsorshipTier: v as SponsorshipTier })}
              disabled={!tierPricing.length}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={tierPricing.length ? "Select Platinum, Gold, or Silver" : "Tier pricing not configured"} />
              </SelectTrigger>
              <SelectContent>
                {tierPricing.map((t) => (
                  <SelectItem key={t.tier} value={t.tier.charAt(0).toUpperCase() + t.tier.slice(1)}>
                    {t.tier} — ${t.amountUsd.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-serif font-bold">Organisation details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Company name *</Label>
            <Input
              required
              placeholder="e.g. Green Harvest Ltd"
              value={org.companyName}
              onChange={(e) => setOrg({ ...org, companyName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Contact name *</Label>
            <Input
              required
              placeholder="e.g. Jane Uwimana"
              value={org.contactName}
              onChange={(e) => setOrg({ ...org, contactName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Contact email *</Label>
            <Input
              required
              type="email"
              placeholder="e.g. contact@company.rw"
              value={org.contactEmail}
              onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Contact phone</Label>
            <Input
              placeholder="e.g. +250 788 000 000"
              value={org.contactPhone}
              onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>About your organisation *</Label>
            <Textarea
              required
              rows={3}
              placeholder="Describe your products, innovations, or sponsorship goals for NAS 2026…"
              value={org.description}
              onChange={(e) => setOrg({ ...org, description: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-serif font-bold">Preferred booth (optional)</h2>
        <p className="text-sm text-muted-foreground">
          {isSponsor
            ? "Your sponsorship tier includes a booth — pick a preferred location if you have one."
            : "Pick a preferred booth location on the floor map."}
        </p>
        <BoothMapPicker booths={booths} mode="pick" selectedId={pickedBooth?.id} onSelect={setPickedBooth} />
        {pickedBooth ? (
          <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
            <span>
              Preferred: <strong className="font-mono">{pickedBooth.code}</strong>
            </span>
          </div>
        ) : null}
      </div>

      <Button type="submit" disabled={submitting} className="gradient-blue text-accent-foreground w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1" /> Submitting…
          </>
        ) : (
          "Submit application"
        )}
      </Button>
    </form>
  );
}
