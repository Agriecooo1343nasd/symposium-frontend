export const ADMIN_EXHIBITOR_TABS = [
  "exhibitors",
  "sponsors",
  "sponsorship-applications",
  "applications",
  "packages",
  "tiers",
  "map",
  "analytics",
] as const;

export const DESK_EXHIBITOR_TABS = ["exhibitors", "sponsors", "applications", "analytics"] as const;

export type AdminExhibitorTab = (typeof ADMIN_EXHIBITOR_TABS)[number];
export type DeskExhibitorTab = (typeof DESK_EXHIBITOR_TABS)[number];
export type ExhibitorPortalTab = AdminExhibitorTab | DeskExhibitorTab;

export const TAB_LABELS: Record<string, string> = {
  exhibitors: "Exhibitors",
  sponsors: "Sponsorship records",
  "sponsorship-applications": "Sponsorship applications (FR-5.1)",
  applications: "Applications",
  packages: "Booth packages",
  tiers: "Tier benefits",
  map: "Booth map",
  analytics: "Analytics",
};

export function isExhibitorParticipation(p: string) {
  return p === "exhibitor" || p === "both";
}

export function isSponsorParticipation(p: string) {
  return p === "sponsor" || p === "both";
}

export const tierColor = (t: string) => {
  const tier = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  return tier === "Platinum"
    ? "bg-slate-200 text-slate-900"
    : tier === "Gold"
      ? "bg-amber-100 text-amber-900"
      : "bg-zinc-200 text-zinc-900";
};
