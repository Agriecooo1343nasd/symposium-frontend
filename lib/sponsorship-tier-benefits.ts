import type { SponsorshipTierConfig } from "@/lib/store";

export const TIER_BENEFIT_FIELDS = [
  { id: "staffPasses" as const, label: "Staff passes", type: "number" as const, placeholder: "e.g. 10" },
  { id: "brochureSlots" as const, label: "Brochure slots", type: "number" as const, placeholder: "e.g. 5" },
  { id: "leadCapture" as const, label: "Lead capture", type: "boolean" as const },
  { id: "speakingSlot" as const, label: "Speaking slot", type: "boolean" as const },
  { id: "homepageFeature" as const, label: "Homepage feature", type: "boolean" as const },
  { id: "newsletterMention" as const, label: "Newsletter mention", type: "boolean" as const },
  { id: "boothListing" as const, label: "Booth listing", type: "boolean" as const },
];

export function normalizeTierConfig(t: SponsorshipTierConfig): SponsorshipTierConfig {
  const benefitsLower = t.benefits.map((b) => b.toLowerCase());
  return {
    ...t,
    speakingSlot: t.speakingSlot ?? benefitsLower.some((b) => b.includes("speaking")),
    newsletterMention: t.newsletterMention ?? benefitsLower.some((b) => b.includes("newsletter")),
    boothListing: t.boothListing ?? benefitsLower.some((b) => b.includes("booth listing")),
    leadCapture: t.leadCapture ?? false,
    homepageFeature: t.homepageFeature ?? false,
    staffPasses: t.staffPasses ?? 0,
    brochureSlots: t.brochureSlots ?? 0,
  };
}

export function buildTierBenefitsList(t: SponsorshipTierConfig): string[] {
  const c = normalizeTierConfig(t);
  const items: string[] = [];
  if (c.staffPasses > 0) {
    items.push(`${c.staffPasses} staff pass${c.staffPasses === 1 ? "" : "es"}`);
  }
  if (c.brochureSlots > 0) {
    items.push(`${c.brochureSlots} brochure slot${c.brochureSlots === 1 ? "" : "s"}`);
  }
  if (c.leadCapture) items.push("Lead capture");
  if (c.speakingSlot) items.push("Speaking slot");
  if (c.homepageFeature) items.push("Homepage feature");
  if (c.newsletterMention) items.push("Newsletter mention");
  if (c.boothListing) items.push("Booth listing");
  return items;
}

export function tierBenefitSummary(t: SponsorshipTierConfig): string {
  const c = normalizeTierConfig(t);
  const flags = [
    c.leadCapture && "Lead capture",
    c.speakingSlot && "Speaking",
    c.homepageFeature && "Homepage",
    c.newsletterMention && "Newsletter",
    c.boothListing && "Booth listing",
  ].filter(Boolean);
  return flags.length ? flags.join(" · ") : "No optional benefits enabled";
}
