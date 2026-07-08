import type { ExhibitorProfileDto } from "@/lib/api/dto";

export type ExhibitorParticipation = "exhibitor" | "sponsor" | "both";

export function deriveExhibitorParticipation(
  profile: ExhibitorProfileDto | null | undefined,
  hasLinkedSponsor?: boolean,
): ExhibitorParticipation {
  if (!profile) return hasLinkedSponsor ? "sponsor" : "exhibitor";
  const hasBooth = Boolean(profile.boothNumber || profile.packageId || profile.package);
  const hasSponsor = Boolean(profile.sponsorId) || Boolean(hasLinkedSponsor);
  if (hasSponsor && hasBooth) return "both";
  if (hasSponsor) return "sponsor";
  return "exhibitor";
}

export function exhibitorDisplayName(profile: ExhibitorProfileDto | null | undefined): string {
  return profile?.companyName ?? profile?.sponsorName ?? "Your organization";
}

export function staffPassQuota(profile: ExhibitorProfileDto | null | undefined): number {
  return profile?.package?.staffPassQuota ?? profile?.staffPassQuota ?? 0;
}
