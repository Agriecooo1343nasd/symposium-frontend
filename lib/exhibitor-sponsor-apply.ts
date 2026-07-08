import type { ExhibitorPackageDto, SponsorshipTierPricingDto } from "@/lib/api/dto";
import { EVENT } from "@/lib/mock-data";
import type { SponsorshipTier } from "@/lib/store";

export type ApplyParticipationType = "exhibitor" | "sponsor";

export type ExhibitorApplicationPayload = {
  symposiumId: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  packageId: string;
  message?: string;
  preferredBoothId?: string;
  staffCount?: number;
  quotedFeeUsd?: number;
};

export type SponsorshipApplicationPayload = {
  symposiumId?: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  desiredTier: "platinum" | "gold" | "silver";
  message?: string;
  wantsExhibitorBooth: boolean;
};

export type ApplyMetadata = {
  participationType: ApplyParticipationType;
  packageId?: string;
  packageName?: string;
  preferredBoothId?: string;
  preferredBoothCode?: string;
  staffCount?: number;
  quotedFeeUsd?: number;
  quotedFeeRwf?: number;
};

const META_PREFIX = "--- NAS application metadata ---";

export function buildApplicationMessage(description: string, meta: ApplyMetadata): string {
  const body = description.trim();
  const block = `${META_PREFIX}\n${JSON.stringify(meta)}`;
  return body ? `${body}\n\n${block}` : block;
}

export function parseApplyMetadata(message?: string | null): ApplyMetadata | null {
  if (!message?.includes(META_PREFIX)) return null;
  const json = message.split(META_PREFIX)[1]?.trim();
  if (!json) return null;
  try {
    return JSON.parse(json) as ApplyMetadata;
  } catch {
    return null;
  }
}

export function calculatePackageEstimate(input: {
  participation: ApplyParticipationType;
  tier?: SponsorshipTier;
  staffCount: number;
  packages: ExhibitorPackageDto[];
  tierPricing: SponsorshipTierPricingDto[];
  selectedPackageId?: string;
  exchangeRate?: number;
}): {
  feeUsd: number;
  feeRwf: number;
  includedStaff: number;
  packageName?: string;
  tierLabel?: string;
} {
  const { participation, tier, packages, tierPricing, selectedPackageId, exchangeRate = EVENT.exchangeRate } = input;
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) ?? packages[0];
  const tierPrice = tierPricing.find((t) => t.tier.toLowerCase() === tier?.toLowerCase());

  let feeUsd = 0;
  let feeRwf = 0;
  let includedStaff = 0;

  if (participation === "exhibitor") {
    if (selectedPackage) {
      feeUsd = Number(selectedPackage.priceUsd);
      feeRwf = Math.round(Number(selectedPackage.priceUsd) * exchangeRate);
      includedStaff = selectedPackage.staffPassQuota;
    }
  }

  if (participation === "sponsor") {
    if (tierPrice) {
      feeUsd = tierPrice.amountUsd;
      feeRwf = tierPrice.amountRwf;
      includedStaff = tierPrice.benefits?.staffPasses ?? 2;
    }
  }

  return {
    feeUsd,
    feeRwf,
    includedStaff,
    packageName: selectedPackage?.name,
    tierLabel: tierPrice?.tier,
  };
}

export function tierToApi(desired: SponsorshipTier): "platinum" | "gold" | "silver" {
  return desired.toLowerCase() as "platinum" | "gold" | "silver";
}

export function defaultTierFromPricing(
  pricing: SponsorshipTierPricingDto[],
  fallback: SponsorshipTier = "Silver",
): SponsorshipTier {
  const silver = pricing.find((p) => p.tier.toLowerCase() === "silver");
  if (silver) return "Silver";
  const first = pricing[0];
  if (!first) return fallback;
  return (first.tier.charAt(0).toUpperCase() + first.tier.slice(1)) as SponsorshipTier;
}

/** Booth on the floor — exhibitor package or sponsorship tier benefit. */
export function participationIncludesBooth(_participation: ApplyParticipationType): boolean {
  return true;
}

/** Sponsorship applications always include a booth (tier benefit matrix). */
export function sponsorshipWantsBooth(participation: ApplyParticipationType): boolean {
  return participation === "sponsor";
}
