"use client";

import { useState } from "react";
import { Percent, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/hooks/use-store";
import { patchStore, DEFAULT_GROUP_REGISTRATION_SETTINGS } from "@/lib/store";
import { GroupDiscountTiersCard } from "@/components/group/GroupDiscountTiersCard";
import { toast } from "sonner";

export function GroupRegistrationSettingsPanel() {
  const store = useStore();
  const current = {
    ...DEFAULT_GROUP_REGISTRATION_SETTINGS,
    ...store.platformSettings.groupRegistration,
  };
  const [enabled, setEnabled] = useState(current.enabled);
  const [minSize, setMinSize] = useState(String(current.minSize));
  const [maxSize, setMaxSize] = useState(String(current.maxSize));
  const [tier59, setTier59] = useState(String(current.tier5to9Percent));
  const [tier10, setTier10] = useState(String(current.tier10PlusPercent));

  const previewSettings = {
    enabled,
    minSize: Number(minSize) || current.minSize,
    maxSize: Number(maxSize) || current.maxSize,
    tier5to9Percent: Number(tier59) || current.tier5to9Percent,
    tier10PlusPercent: Number(tier10) || current.tier10PlusPercent,
  };

  const examplePlan = store.ticketPlans.find((t) => t.popular && !t.isMediaAccreditation) ?? store.ticketPlans[0];

  const save = () => {
    const min = Math.max(2, Number(minSize) || 5);
    const max = Math.max(min, Number(maxSize) || 30);
    patchStore((s) => ({
      ...s,
      platformSettings: {
        ...s.platformSettings,
        groupRegistration: {
          enabled,
          minSize: min,
          maxSize: max,
          tier5to9Percent: Math.min(100, Math.max(0, Number(tier59) || 0)),
          tier10PlusPercent: Math.min(100, Math.max(0, Number(tier10) || 0)),
        },
      },
    }));
    toast.success("Group registration settings saved — visible on /register and homepage");
  };

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
                Controls volume discounts on the public registration page and homepage. Finance reports use the same
                rates when reconciling group invoices.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 shrink-0">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <Label>Enabled on /register</Label>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Minimum group size</Label>
            <Input type="number" min={2} value={minSize} onChange={(e) => setMinSize(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Maximum group size</Label>
            <Input type="number" min={2} value={maxSize} onChange={(e) => setMaxSize(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Discount {previewSettings.minSize}–9 (%)</Label>
            <Input type="number" min={0} max={100} value={tier59} onChange={(e) => setTier59(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Discount 10+ (%)</Label>
            <Input type="number" min={0} max={100} value={tier10} onChange={(e) => setTier10(e.target.value)} className="mt-1" />
          </div>
        </div>

        <Button onClick={save} className="gradient-blue text-accent-foreground">
          <Save className="h-4 w-4 mr-1" /> Save discount settings
        </Button>
      </div>

      {enabled && (
        <GroupDiscountTiersCard
          settings={previewSettings}
          examplePriceUsd={examplePlan?.usd ?? 150}
          exchangeRate={store.platformSettings.exchangeRate}
          compact
        />
      )}
    </div>
  );
}
