import { useState } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import { patchStore, type SponsorshipTierConfig, type SponsorshipTier } from "@/lib/store";
import {
  buildTierBenefitsList,
  normalizeTierConfig,
  TIER_BENEFIT_FIELDS,
  tierBenefitSummary,
} from "@/lib/sponsorship-tier-benefits";
import { toast } from "sonner";

const tierColor = (t: string) =>
  t === "Platinum" ? "bg-slate-200 text-slate-900" : t === "Gold" ? "bg-amber-100 text-amber-900" : "bg-zinc-200 text-zinc-900";

const DEFAULT_TIERS: Record<SponsorshipTier, SponsorshipTierConfig> = {
  Platinum: {
    tier: "Platinum",
    benefits: [],
    staffPasses: 10,
    brochureSlots: 5,
    leadCapture: true,
    speakingSlot: true,
    homepageFeature: true,
    newsletterMention: false,
    boothListing: false,
    baseFeeUsd: 15000,
    extraStaffFeeUsd: 350,
  },
  Gold: {
    tier: "Gold",
    benefits: [],
    staffPasses: 4,
    brochureSlots: 3,
    leadCapture: true,
    speakingSlot: false,
    homepageFeature: false,
    newsletterMention: true,
    boothListing: false,
    baseFeeUsd: 8000,
    extraStaffFeeUsd: 400,
  },
  Silver: {
    tier: "Silver",
    benefits: [],
    staffPasses: 2,
    brochureSlots: 1,
    leadCapture: false,
    speakingSlot: false,
    homepageFeature: false,
    newsletterMention: false,
    boothListing: true,
    baseFeeUsd: 3500,
    extraStaffFeeUsd: 450,
  },
};

Object.keys(DEFAULT_TIERS).forEach((k) => {
  const key = k as SponsorshipTier;
  DEFAULT_TIERS[key].benefits = buildTierBenefitsList(DEFAULT_TIERS[key]);
});

export function SponsorshipTierEditor() {
  const store = useStore();
  const [editing, setEditing] = useState<SponsorshipTierConfig | null>(null);

  const openEdit = (t: SponsorshipTierConfig) => {
    setEditing(normalizeTierConfig({ ...t }));
  };

  const save = () => {
    if (!editing) return;
    const normalized = normalizeTierConfig(editing);
    const next: SponsorshipTierConfig = {
      ...normalized,
      benefits: buildTierBenefitsList(normalized),
    };
    patchStore((s) => ({
      ...s,
      sponsorshipTiers: s.sponsorshipTiers.map((t) => (t.tier === next.tier ? next : t)),
    }));
    toast.success(`${next.tier} tier updated`);
    setEditing(null);
  };

  const resetTier = (tier: SponsorshipTier) => {
    patchStore((s) => ({
      ...s,
      sponsorshipTiers: s.sponsorshipTiers.map((t) => (t.tier === tier ? { ...DEFAULT_TIERS[tier] } : t)),
    }));
    toast.info(`${tier} reset to defaults`);
  };

  const previewBenefits = editing ? buildTierBenefitsList(editing) : [];

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.sponsorshipTiers.map((t) => {
          const tier = normalizeTierConfig(t);
          return (
            <div key={t.tier} className="rounded-2xl bg-card border p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(t.tier)}`}>{t.tier}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)} title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => resetTier(t.tier)} title="Reset to defaults">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs flex-1">
                {tier.benefits.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-1">
                <div>{tier.staffPasses} staff passes · {tier.brochureSlots} brochure slots</div>
                <div>${tier.baseFeeUsd.toLocaleString()} base · +${tier.extraStaffFeeUsd}/extra staff</div>
                <div>{tierBenefitSummary(tier)}</div>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => openEdit(t)}>
                Edit tier
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editing?.tier} sponsorship tier</DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Configure included benefits. The public perks list updates automatically from these settings.
            </p>
          </DialogHeader>
          {editing && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Included quantities</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {TIER_BENEFIT_FIELDS.filter((f) => f.type === "number").map((field) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <Input
                        id={field.id}
                        type="number"
                        min={0}
                        value={editing[field.id]}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [field.id]: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="mt-1"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Optional benefits</h3>
                <div className="rounded-xl border divide-y">
                  {TIER_BENEFIT_FIELDS.filter((f) => f.type === "boolean").map((field) => (
                    <label
                      key={field.id}
                      htmlFor={`toggle-${field.id}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-secondary/30"
                    >
                      <span className="text-sm font-medium">{field.label}</span>
                      <Switch
                        id={`toggle-${field.id}`}
                        checked={editing[field.id]}
                        onCheckedChange={(checked) => setEditing({ ...editing, [field.id]: checked })}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Pricing</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseFeeUsd">Base fee (USD)</Label>
                    <Input
                      id="baseFeeUsd"
                      type="number"
                      min={0}
                      value={editing.baseFeeUsd}
                      onChange={(e) => setEditing({ ...editing, baseFeeUsd: Number(e.target.value) || 0 })}
                      className="mt-1"
                      placeholder="e.g. 15000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="extraStaffFeeUsd">Extra staff fee (USD)</Label>
                    <Input
                      id="extraStaffFeeUsd"
                      type="number"
                      min={0}
                      value={editing.extraStaffFeeUsd}
                      onChange={(e) => setEditing({ ...editing, extraStaffFeeUsd: Number(e.target.value) || 0 })}
                      className="mt-1"
                      placeholder="Per pass beyond quota"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/40 p-4">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Preview — benefits list</p>
                {previewBenefits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No benefits enabled yet.</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {previewBenefits.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} className="gradient-blue text-accent-foreground">
              Update tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
