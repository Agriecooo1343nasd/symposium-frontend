"use client";

import { useEffect, useMemo, useState } from "react";
import { Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { useSymposiumSettings, useUpdateSymposiumSettings } from "@/hooks/api/useEngage";
import { GroupDiscountTiersCard } from "@/components/group/GroupDiscountTiersCard";
import { getServerGroupRegistrationSettings } from "@/lib/group-registration-policy";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

type GroupSettingsDraft = {
  minSize: number;
  maxSize: number;
  tier5to9Percent: number;
  tier10PlusPercent: number;
};

export function GroupRegistrationSettingsPanel() {
  const store = useStore();
  const { settings: apiSettings } = useSymposiumSettings();
  const updateSettings = useUpdateSymposiumSettings();
  const fallback = getServerGroupRegistrationSettings();
  const serverDraft = useMemo<GroupSettingsDraft>(() => {
    const tiers = apiSettings?.registration?.groupDiscountTiers ?? [];
    const minTierMembers =
      tiers.length > 0 ? Math.min(...tiers.map((tier) => tier.minMembers)) : fallback.minSize;
    const finiteMaxMembers = tiers
      .map((tier) => tier.maxMembers)
      .filter((value): value is number => typeof value === "number");
    const maxTierMembers =
      finiteMaxMembers.length > 0 ? Math.max(...finiteMaxMembers) : fallback.maxSize;
    const tier5to9 = tiers.find(
      (tier) => tier.minMembers <= 9 && (tier.maxMembers ?? 9) <= 9,
    );
    const tier10Plus = tiers.find(
      (tier) => tier.minMembers >= 10 && (tier.maxMembers == null || tier.maxMembers >= tier.minMembers),
    );
    return {
      minSize: minTierMembers,
      maxSize: maxTierMembers,
      tier5to9Percent: tier5to9?.percent ?? fallback.tier5to9Percent,
      tier10PlusPercent: tier10Plus?.percent ?? fallback.tier10PlusPercent,
    };
  }, [apiSettings?.registration?.groupDiscountTiers, fallback.maxSize, fallback.minSize, fallback.tier10PlusPercent, fallback.tier5to9Percent]);
  const [draft, setDraft] = useState<GroupSettingsDraft | null>(null);

  useEffect(() => {
    if (!draft) return;
    setDraft(serverDraft);
    // keep local draft aligned after successful save/refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiSettings?.registration?.groupDiscountTiers]);

  const settings = draft ?? serverDraft;
  const previewSettings = {
    ...fallback,
    ...settings,
  };
  const examplePlan = store.ticketPlans.find((t) => t.popular && !t.isMediaAccreditation) ?? store.ticketPlans[0];
  const isDirty = Boolean(draft);

  const updateField = (key: keyof GroupSettingsDraft, value: number) => {
    setDraft((prev) => ({ ...(prev ?? serverDraft), [key]: Math.max(0, value) }));
  };

  const save = async () => {
    if (settings.minSize < 1) return toast.error("Minimum group size must be at least 1");
    if (settings.maxSize < settings.minSize) return toast.error("Max size cannot be lower than minimum size");
    if (settings.tier5to9Percent < 0 || settings.tier5to9Percent > 100) return toast.error("Discounts must be between 0 and 100");
    if (settings.tier10PlusPercent < 0 || settings.tier10PlusPercent > 100) return toast.error("Discounts must be between 0 and 100");

    const minSize = Math.floor(settings.minSize);
    const maxSize = Math.floor(settings.maxSize);
    const upperTierMax = Math.min(9, maxSize);
    const lowerTierMin = Math.max(10, minSize);

    try {
      await updateSettings.mutateAsync({
        registration: {
          groupDiscountTiers: [
            { minMembers: minSize, maxMembers: upperTierMax, percent: settings.tier5to9Percent },
            { minMembers: lowerTierMin, maxMembers: null, percent: settings.tier10PlusPercent },
          ],
        },
      });
      setDraft(null);
      toast.success("Group discount settings saved");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
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
                Update live group discount tiers used by the backend when creating group registrations.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!isDirty || updateSettings.isPending} onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button className="gradient-blue text-accent-foreground" disabled={!isDirty || updateSettings.isPending} onClick={save}>
              {updateSettings.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Minimum group size</Label>
            <Input
              type="number"
              min={1}
              value={settings.minSize}
              onChange={(e) => updateField("minSize", Number(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Recommended max (UI cap)</Label>
            <Input
              type="number"
              min={settings.minSize}
              value={settings.maxSize}
              onChange={(e) => updateField("maxSize", Number(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Discount {settings.minSize}–9 (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={settings.tier5to9Percent}
              onChange={(e) => updateField("tier5to9Percent", Number(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Discount 10+ (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={settings.tier10PlusPercent}
              onChange={(e) => updateField("tier10PlusPercent", Number(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {previewSettings.enabled && (
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
