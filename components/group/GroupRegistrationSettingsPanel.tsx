"use client";

import { Percent, Server } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/use-store";
import { GroupDiscountTiersCard } from "@/components/group/GroupDiscountTiersCard";
import { getServerGroupRegistrationSettings } from "@/lib/group-registration-policy";

export function GroupRegistrationSettingsPanel() {
  const store = useStore();
  const settings = getServerGroupRegistrationSettings();
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
                Volume discounts are computed on the server when a group is created. Values below match the live API
                policy — they cannot be edited here until a settings endpoint is available.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground shrink-0">
            <Server className="h-3.5 w-3.5" />
            Server policy (read-only)
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
