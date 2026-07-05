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
import { patchStore, uid, type OrgType, type ParticipationType, type SponsorshipTier, type Booth } from "@/lib/store";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { BoothMapPicker } from "@/components/shared/BoothMapPicker";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export default function ApplyExhibitPage() {
  const router = useRouter();
  const store = useStore();
  const { session } = useAuth();
  const { symposiumId } = useSymposium();
  const { packages, isLoading: packagesLoading } = usePublicExhibitorPackages(symposiumId || undefined);
  const { pricing: tierPricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const createSponsorshipApplication = useCreateSponsorshipApplication();

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
    packageId: "" as string,
  });
  const [staffCount, setStaffCount] = useState(2);
  const [pickedBooth, setPickedBooth] = useState<Booth | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activePackages = packages.filter((p) => p.isActive);

  const handleBoothPick = (b: Booth) => {
    setPickedBooth(b);
    setOrg((p) => ({ ...p, preferredBoothId: b.id, boothPreference: b.code }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId) return toast.error("Symposium not loaded — please retry.");

    const boothNote = pickedBooth
      ? `Preferred booth: ${pickedBooth.code}${org.boothPreference ? ` (${org.boothPreference})` : ""}.`
      : org.boothPreference
        ? `Booth preference: ${org.boothPreference}.`
        : "";
    const packageNote = org.packageId
      ? `Package: ${activePackages.find((p) => p.id === org.packageId)?.name ?? org.packageId}.`
      : "";
    const message = [org.description, boothNote, packageNote].filter(Boolean).join("\n\n");

    if (org.participation === "sponsor" || org.participation === "both") {
      try {
        setSubmitting(true);
        await createSponsorshipApplication.mutateAsync({
          symposiumId,
          organizationName: org.companyName,
          contactName: org.contactName,
          contactEmail: org.contactEmail,
          contactPhone: org.contactPhone,
          desiredTier: org.sponsorshipTier.toLowerCase() as "platinum" | "gold" | "silver",
          message: message || undefined,
          wantsExhibitorBooth: org.participation === "both",
        });
        toast.success("Sponsorship application submitted");
        router.push("/dashboard");
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    patchStore((s) => ({
      ...s,
      organizationApplications: [
        {
          id: uid("oa"),
          ...org,
          staffCount,
          quotedFeeUsd: activePackages.find((p) => p.id === org.packageId)?.priceUsd ?? 0,
          status: "pending",
          paymentStatus: "unpaid",
          submittedAt: new Date().toISOString().slice(0, 10),
        },
        ...s.organizationApplications,
      ],
    }));
    toast.success("Exhibitor-only application saved locally — no public exhibitor apply API yet");
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
            Sponsorship applications submit to the API. Exhibitor-only requests are queued locally until a public apply endpoint exists.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          {packagesLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading exhibitor packages…
            </div>
          ) : (
            <ExhibitorPackageEstimator
              store={store}
              participation={org.participation}
              tier={org.sponsorshipTier}
              staffCount={staffCount}
              onStaffCountChange={setStaffCount}
              packages={activePackages}
              tierPricing={tierPricing}
              selectedPackageId={org.packageId || activePackages[0]?.id}
            />
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-serif font-bold">Package details</h2>
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

          {(org.participation === "exhibitor" || org.participation === "both") && (
            <div>
              <Label>Exhibitor package *</Label>
              <Select
                value={org.packageId || activePackages[0]?.id || ""}
                onValueChange={(v) => setOrg({ ...org, packageId: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={activePackages.length ? "Select package" : "No packages published"} />
                </SelectTrigger>
                <SelectContent>
                  {activePackages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — ${p.priceUsd.toLocaleString()} · {p.staffPassQuota} staff passes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                    ? tierPricing.map((t) => (
                        <SelectItem key={t.tier} value={t.tier.charAt(0).toUpperCase() + t.tier.slice(1)}>
                          {t.tier} — ${t.amountUsd.toLocaleString()}
                        </SelectItem>
                      ))
                    : (["Platinum", "Gold", "Silver"] as SponsorshipTier[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      )))}
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
                value={org.companyName}
                onChange={(e) => setOrg({ ...org, companyName: e.target.value })}
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

        {(org.participation === "exhibitor" || org.participation === "both") && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <h2 className="font-serif font-bold">Preferred booth</h2>
            <BoothMapPicker booths={store.booths} mode="pick" selectedId={pickedBooth?.id} onSelect={handleBoothPick} />
            {pickedBooth ? (
              <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                <span>
                  Preferred: <strong className="font-mono">{pickedBooth.code}</strong>
                </span>
              </div>
            ) : null}
          </div>
        )}

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
    </div>
  );
}
