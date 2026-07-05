"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import {
  useCreateSponsorshipApplication,
  usePublicExhibitorPackages,
  useSponsorshipTierPricing,
} from "@/hooks/api/useExhibitor";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { BoothMapPicker } from "@/components/shared/BoothMapPicker";
import { apiErrorMessage } from "@/lib/api/client";
import type { ExhibitorPackageDto } from "@/lib/api/dto";
import { patchStore, uid, type OrgType, type ParticipationType, type SponsorshipTier, type Booth } from "@/lib/store";
import { toast } from "sonner";

export default function ApplyExhibitPage() {
  const router = useRouter();
  const store = useStore();
  const { session } = useAuth();
  const { symposiumId } = useSymposium();
  const { packages, isLoading: packagesLoading } = usePublicExhibitorPackages(symposiumId || undefined);
  const { pricing: tierPricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const createSponsorshipApplication = useCreateSponsorshipApplication();
  const [submitting, setSubmitting] = useState(false);

  const [org, setOrg] = useState({
    companyName: "",
    orgType: "company" as OrgType,
    website: "",
    description: "",
    contactName: session?.name ?? "",
    contactEmail: session?.email ?? "",
    contactPhone: "",
    participation: "exhibitor" as ParticipationType,
    sponsorshipTier: "Silver" as SponsorshipTier,
    boothPreference: "",
    preferredBoothId: "" as string,
  });
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [staffCount, setStaffCount] = useState(2);
  const [pickedBooth, setPickedBooth] = useState<Booth | null>(null);

  const selectedPackage: ExhibitorPackageDto | null =
    packages.find((p) => p.id === selectedPackageId) ?? packages[0] ?? null;

  const handleBoothPick = (b: Booth) => {
    setPickedBooth(b);
    setOrg((p) => ({ ...p, preferredBoothId: b.id, boothPreference: b.code }));
  };

  const buildMessage = () => {
    const parts = [org.description?.trim()].filter(Boolean);
    if (selectedPackage) parts.push(`Preferred exhibitor package: ${selectedPackage.name} (${selectedPackage.slug}).`);
    if (org.boothPreference) parts.push(`Booth preference: ${org.boothPreference}.`);
    if (org.website) parts.push(`Website: ${org.website}.`);
    parts.push(`Staff count: ${staffCount}.`);
    return parts.join("\n");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org.companyName.trim() || !org.contactName.trim() || !org.contactEmail.trim()) {
      return toast.error("Company and contact details are required.");
    }

    if (org.participation === "sponsor" || org.participation === "both") {
      try {
        setSubmitting(true);
        await createSponsorshipApplication.mutateAsync({
          symposiumId: symposiumId || undefined,
          organizationName: org.companyName.trim(),
          contactName: org.contactName.trim(),
          contactEmail: org.contactEmail.trim(),
          contactPhone: org.contactPhone.trim(),
          desiredTier: org.sponsorshipTier.toLowerCase() as "platinum" | "gold" | "silver",
          message: buildMessage(),
          wantsExhibitorBooth: org.participation === "both",
        });
        toast.success("Sponsorship application submitted — secretariat will review within 3 business days");
        router.push("/dashboard");
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Exhibitor-only: no public booth application endpoint — save preference locally for desk review
    patchStore((s) => ({
      ...s,
      organizationApplications: [
        {
          id: uid("oa"),
          ...org,
          staffCount,
          quotedFeeUsd: selectedPackage?.priceUsd ?? 0,
          status: "pending",
          paymentStatus: "unpaid",
          submittedAt: new Date().toISOString().slice(0, 10),
        },
        ...s.organizationApplications,
      ],
    }));
    toast.success("Exhibitor interest saved — apply for sponsorship or await secretariat contact");
    router.push("/dashboard");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Store className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold leading-tight">Apply to exhibit or sponsor</h1>
          <p className="text-muted-foreground text-sm">
            Packages from the live catalog. Sponsorship applications submit to the API; exhibitor-only requests are queued locally until a public booth apply endpoint ships.
          </p>
        </div>
      </div>

      {packagesLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading exhibitor packages…
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6">
            <ExhibitorPackageEstimator
              store={store}
              participation={org.participation}
              tier={org.sponsorshipTier}
              staffCount={staffCount}
              onStaffCountChange={setStaffCount}
              apiPackage={selectedPackage}
              tierPricing={tierPricing}
            />
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <h2 className="font-serif font-bold">Package details</h2>
            {packages.length > 0 && (
              <div>
                <Label>Exhibitor package (catalog)</Label>
                <Select
                  value={selectedPackageId || selectedPackage?.id || ""}
                  onValueChange={setSelectedPackageId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${p.priceUsd.toLocaleString()} ({p.staffPassQuota} staff passes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPackage?.description && (
                  <p className="text-xs text-muted-foreground mt-2">{selectedPackage.description}</p>
                )}
              </div>
            )}
            <div>
              <Label>Participation type *</Label>
              <Select
                value={org.participation}
                onValueChange={(v) => setOrg({ ...org, participation: v as ParticipationType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exhibitor">Exhibitor only</SelectItem>
                  <SelectItem value="sponsor">Sponsor only</SelectItem>
                  <SelectItem value="both">Exhibitor + Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(org.participation === "sponsor" || org.participation === "both") && (
              <div>
                <Label>Sponsorship tier *</Label>
                <Select
                  value={org.sponsorshipTier}
                  onValueChange={(v) => setOrg({ ...org, sponsorshipTier: v as SponsorshipTier })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(tierPricing.length
                      ? tierPricing.map((t) => ({
                          key: t.tier,
                          label: `${t.tier.charAt(0).toUpperCase()}${t.tier.slice(1)} — $${t.amountUsd.toLocaleString()}`,
                          value: `${t.tier.charAt(0).toUpperCase()}${t.tier.slice(1)}` as SponsorshipTier,
                        }))
                      : store.sponsorshipTiers.map((t) => ({
                          key: t.tier,
                          label: `${t.tier} — $${t.baseFeeUsd.toLocaleString()}`,
                          value: t.tier,
                        }))
                    ).map((opt) => (
                      <SelectItem key={opt.key} value={opt.value}>
                        {opt.label}
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
                  placeholder="Organization legal name"
                  value={org.companyName}
                  onChange={(e) => setOrg({ ...org, companyName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Organization type</Label>
                <Select value={org.orgType} onValueChange={(v) => setOrg({ ...org, orgType: v as OrgType })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["startup", "ngo", "university", "research", "company"] as const).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  placeholder="https://www.example.org"
                  value={org.website}
                  onChange={(e) => setOrg({ ...org, website: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contact name *</Label>
                <Input
                  required
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
                  value={org.contactEmail}
                  onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Contact phone</Label>
                <Input
                  value={org.contactPhone}
                  onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Description *</Label>
                <Textarea
                  required
                  rows={3}
                  value={org.description}
                  onChange={(e) => setOrg({ ...org, description: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div>
              <h2 className="font-serif font-bold">Choose a preferred booth</h2>
              <p className="text-sm text-muted-foreground mt-1">Optional — included in your application message.</p>
            </div>
            <BoothMapPicker booths={store.booths} mode="pick" selectedId={pickedBooth?.id} onSelect={handleBoothPick} />
            {pickedBooth ? (
              <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                <span>
                  Preferred: <strong className="font-mono">{pickedBooth.code}</strong>
                </span>
              </div>
            ) : null}
            <div>
              <Label>Additional notes (optional)</Label>
              <Input
                value={org.boothPreference}
                onChange={(e) => setOrg({ ...org, boothPreference: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="gradient-blue text-accent-foreground w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
