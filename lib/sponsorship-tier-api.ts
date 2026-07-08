import type { SponsorshipTierBenefitsDto, SponsorshipTierPricingDto } from "@/lib/api/dto";
import type { SponsorshipTier, SponsorshipTierConfig } from "@/lib/store";
import { buildTierBenefitsList } from "@/lib/sponsorship-tier-benefits";

const TIER_SLUGS = ["platinum", "gold", "silver"] as const;

export function tierSlugToLabel(slug: string): SponsorshipTier {
  return (slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()) as SponsorshipTier;
}

export function tierLabelToSlug(label: SponsorshipTier): "platinum" | "gold" | "silver" {
  return label.toLowerCase() as "platinum" | "gold" | "silver";
}

export function pricingRowToTierConfig(row: SponsorshipTierPricingDto): SponsorshipTierConfig {
  const benefits = row.benefits;
  const tier = tierSlugToLabel(row.tier);
  const config: SponsorshipTierConfig = {
    tier,
    benefits: [],
    staffPasses: benefits?.staffPasses ?? 0,
    brochureSlots: benefits?.brochureSlots ?? 0,
    leadCapture: benefits?.leadCapture ?? false,
    speakingSlot: benefits?.speakingSlot ?? false,
    homepageFeature: benefits?.homepageFeature ?? false,
    newsletterMention: benefits?.newsletterMention ?? false,
    boothListing: benefits?.boothListing ?? false,
    baseFeeUsd: row.amountUsd,
    extraStaffFeeUsd: benefits?.extraStaffFeeUsd ?? 0,
  };
  const built = buildTierBenefitsList(config);
  if (benefits?.boothSize) {
    built.unshift(`Booth size: ${benefits.boothSize}`);
  }
  if (benefits?.highlights?.length) {
    built.push(...benefits.highlights);
  }
  return { ...config, benefits: built };
}

export function tierConfigToBenefitsDto(
  config: SponsorshipTierConfig,
  boothSize?: string | null,
): SponsorshipTierBenefitsDto {
  return {
    boothSize: boothSize ?? null,
    staffPasses: config.staffPasses,
    extraStaffFeeUsd: config.extraStaffFeeUsd,
    brochureSlots: config.brochureSlots,
    leadCapture: config.leadCapture,
    speakingSlot: config.speakingSlot,
    homepageFeature: config.homepageFeature,
    newsletterMention: config.newsletterMention,
    boothListing: config.boothListing,
    highlights: [],
  };
}

export function defaultTierPricingRows(): SponsorshipTierPricingDto[] {
  return TIER_SLUGS.map((tier) => ({
    tier,
    amountUsd: tier === "platinum" ? 25000 : tier === "gold" ? 10000 : 5000,
    amountRwf: tier === "platinum" ? 30000000 : tier === "gold" ? 12000000 : 6000000,
    benefits: {
      boothSize: null,
      staffPasses: tier === "platinum" ? 10 : tier === "gold" ? 4 : 2,
      extraStaffFeeUsd: tier === "platinum" ? 350 : tier === "gold" ? 400 : 450,
      brochureSlots: tier === "platinum" ? 5 : tier === "gold" ? 3 : 1,
      leadCapture: tier !== "silver",
      speakingSlot: tier === "platinum",
      homepageFeature: tier === "platinum",
      newsletterMention: tier === "gold",
      boothListing: tier === "silver",
      highlights: [],
    },
  }));
}

export function mergeTierPricingRows(
  pricing: SponsorshipTierPricingDto[],
): SponsorshipTierPricingDto[] {
  const defaults = defaultTierPricingRows();
  return defaults.map((d) => {
    const row = pricing.find((p) => p.tier.toLowerCase() === d.tier);
    return row
      ? {
          ...d,
          ...row,
          benefits: { ...d.benefits, ...row.benefits },
        }
      : d;
  });
}
