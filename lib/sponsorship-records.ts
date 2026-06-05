import { loadStore, type ApprovedOrganization, type SponsorshipTier } from "./store";

export function isSponsorOrg(org: ApprovedOrganization) {
  return org.participation === "sponsor" || org.participation === "both";
}

export function getSponsorOrganizations(): ApprovedOrganization[] {
  return loadStore().approvedOrganizations.filter(isSponsorOrg);
}

export function getSponsorOrgById(orgId: string): ApprovedOrganization | undefined {
  return loadStore().approvedOrganizations.find((o) => o.id === orgId);
}

/** Homepage / carousel peers — from approved sponsor orgs only (no mock list). */
export function getCarouselSponsorPeers(options?: {
  highlightOrgId?: string;
  tier?: SponsorshipTier;
  limit?: number;
}) {
  const store = loadStore();
  const sponsors = store.approvedOrganizations.filter(isSponsorOrg);
  const filtered = options?.tier
    ? sponsors.filter((o) => o.sponsorshipTier === options.tier || o.sponsorshipTier === "Platinum")
    : sponsors;

  const sorted = [...filtered].sort((a, b) => {
    const tierOrder = { Platinum: 0, Gold: 1, Silver: 2 };
    const ta = tierOrder[a.sponsorshipTier ?? "Silver"];
    const tb = tierOrder[b.sponsorshipTier ?? "Silver"];
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });

  const limit = options?.limit ?? 6;
  const peers = sorted.slice(0, limit).map((o) => ({
    id: o.id,
    name: o.name,
    tier: o.sponsorshipTier ?? "Silver",
    isYou: o.id === options?.highlightOrgId,
  }));

  if (options?.highlightOrgId && !peers.some((p) => p.isYou)) {
    const you = sponsors.find((o) => o.id === options.highlightOrgId);
    if (you) {
      peers.unshift({
        id: you.id,
        name: you.name,
        tier: you.sponsorshipTier ?? "Silver",
        isYou: true,
      });
    }
  }

  return peers;
}

export const DELIVERABLE_CHANNEL_LABELS: Record<string, string> = {
  homepage: "Homepage",
  newsletter: "Newsletter",
  programme: "Programme print",
  signage: "Signage",
  opening: "Opening plenary",
  app: "Delegate app",
};

export const DELIVERABLE_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-secondary text-muted-foreground" },
  in_review: { label: "In review", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", className: "bg-blue/15 text-blue" },
  live: { label: "Live", className: "bg-green/15 text-green" },
};
