import { Users, DollarSign, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT } from "@/lib/mock-data";
import type { ExhibitorPackageDto, SponsorshipTierPricingDto } from "@/lib/api/dto";
import { calculateOrgPackageFee, type AppStore, type ParticipationType, type SponsorshipTier } from "@/lib/store";

type Props = {
  store: AppStore;
  participation: ParticipationType;
  tier?: SponsorshipTier;
  staffCount: number;
  onStaffCountChange: (n: number) => void;
  packages?: ExhibitorPackageDto[];
  tierPricing?: SponsorshipTierPricingDto[];
  selectedPackageId?: string;
};

export function ExhibitorPackageEstimator({
  store,
  participation,
  tier,
  staffCount,
  onStaffCountChange,
  packages = [],
  tierPricing = [],
  selectedPackageId,
}: Props) {
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) ?? packages[0];
  const tierPrice = tierPricing.find((t) => t.tier.toLowerCase() === tier?.toLowerCase());
  const mockQuote = calculateOrgPackageFee(participation, tier, staffCount, store);

  let feeUsd = mockQuote.feeUsd;
  if (selectedPackage && (participation === "exhibitor" || participation === "both")) {
    feeUsd = selectedPackage.priceUsd;
  }
  if (tierPrice && (participation === "sponsor" || participation === "both")) {
    feeUsd = participation === "both" ? feeUsd + tierPrice.amountUsd : tierPrice.amountUsd;
  }

  const includedStaff = selectedPackage?.staffPassQuota ?? mockQuote.includedStaff;
  const rwf = tierPrice?.amountRwf ?? Math.round(feeUsd * EVENT.exchangeRate);

  return (
    <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-secondary/40 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-md bg-accent/15 flex items-center justify-center shrink-0">
          <DollarSign className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-serif font-bold">Package estimate</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Fees from the live exhibitor package catalog and sponsorship tier pricing when available.
            Staff passes are bundled with booth packages.
          </p>
        </div>
      </div>

      {selectedPackage && (
        <p className="text-xs text-muted-foreground">
          Selected package: <strong>{selectedPackage.name}</strong>
          {selectedPackage.boothSize ? ` · ${selectedPackage.boothSize}` : ""}
        </p>
      )}

      <div>
        <Label className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> Staff you plan to bring (booth team)
        </Label>
        <Input
          type="number"
          min={1}
          max={50}
          value={staffCount}
          onChange={(e) => onStaffCountChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="mt-1 max-w-[120px]"
          placeholder="e.g. 4"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          {includedStaff} included in package quota
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-border">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Estimated total</div>
          <div className="font-serif text-3xl font-bold text-accent">${feeUsd.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">≈ RWF {rwf.toLocaleString()}</div>
        </div>
        <div className="text-xs text-muted-foreground max-w-xs flex gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Admin reviews your application and issues an invoice (FR-5.1). Payment confirms booth and staff pass quota.
        </div>
      </div>
    </div>
  );
}
