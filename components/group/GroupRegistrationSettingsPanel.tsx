"use client";

import { Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/use-store";
import { useSymposiumSettings } from "@/hooks/api/useEngage";
import { GroupDiscountTiersCard } from "@/components/group/GroupDiscountTiersCard";
import { getServerGroupRegistrationSettings } from "@/lib/group-registration-policy";

export function GroupRegistrationSettingsPanel() {
  const store = useStore();
  const { settings: apiSettings } = useSymposiumSettings();
  const fallback = getServerGroupRegistrationSettings();
  const tiers = apiSettings?.registration?.groupDiscountTiers ?? [];
  const minTierMembers = tiers.length > 0 ? Math.min(...tiers.map((tier) => tier.minMembers)) : fallback.minSize;
  const finiteMaxMembers = tiers
    .map((tier) => tier.maxMembers)
    .filter((value): value is number => typeof value === "number");
  const maxTierMembers = finiteMaxMembers.length > 0 ? Math.max(...finiteMaxMembers) : fallback.maxSize;
  const tier5to9 = tiers.find((tier) => tier.minMembers === 5 && tier.maxMembers === 9);
  const tier10Plus = tiers.find((tier) => tier.minMembers >= 10 && (tier.maxMembers == null || tier.maxMembers >= tier.minMembers));
  const settings = {
    ...fallback,
    minSize: minTierMembers,
    maxSize: maxTierMembers,
    tier5to9Percent: tier5to9?.percent ?? fallback.tier5to9Percent,
    tier10PlusPercent: tier10Plus?.percent ?? fallback.tier10PlusPercent,
  };
  const examplePlan = store.ticketPlans.find((t) => t.popular && !t.isMediaAccreditation) ?? store.ticketPlans[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
              <Percent className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Group registration &amp; discounts</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Volume discounts are computed on the server when a group is created. Values below mirror symposium
                settings from the API (with a safe fallback when settings are unavailable).
              </p>
            </div>
          </div>
          
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Minimum group size</Label>
            <Input type="number" value={settings.minSize} readOnly disabled className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>Recommended max (UI cap)</Label>
            <Input type="number" value={settings.maxSize} readOnly disabled className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>Discount {settings.minSize}–9 (%)</Label>
            <Input type="number" value={settings.tier5to9Percent} readOnly disabled className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>Discount 10+ (%)</Label>
            <Input type="number" value={settings.tier10PlusPercent} readOnly disabled className="mt-1 bg-muted" />
          </div>
        </div>

  
      </div>

      {settings.enabled && (
        <GroupDiscountTiersCard
          settings={settings}
          examplePriceUsd={examplePlan?.usd ?? 150}
          exchangeRate={store.platformSettings.exchangeRate}
          compact
        />
      )}
    </div>
  );
}
