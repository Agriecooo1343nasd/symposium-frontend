"use client";

import { useMemo, useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSymposiumSettings, useUpdateSymposiumSettings } from "@/hooks/api/useEngage";
import { useSponsorshipTierPricing } from "@/hooks/api/useExhibitor";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import type { SponsorshipTierPricingDto } from "@/lib/api/dto";
import { apiErrorMessage } from "@/lib/api/client";
import {
  mergeTierPricingRows,
  pricingRowToTierConfig,
  tierConfigToBenefitsDto,
  tierLabelToSlug,
  tierSlugToLabel,
} from "@/lib/sponsorship-tier-api";
import {
  buildTierBenefitsList,
  normalizeTierConfig,
  TIER_BENEFIT_FIELDS,
  tierBenefitSummary,
} from "@/lib/sponsorship-tier-benefits";
import type { SponsorshipTierConfig } from "@/lib/store";
import { toast } from "sonner";

const tierColor = (t: string) =>
  t === "Platinum" ? "bg-slate-200 text-slate-900" : t === "Gold" ? "bg-amber-100 text-amber-900" : "bg-zinc-200 text-zinc-900";

type EditState = SponsorshipTierConfig & { boothSize: string; amountRwf: number };

export function SponsorshipTierEditor() {
  const symposiumId = useSymposiumId();
  const { pricing, isLoading: pricingLoading } = useSponsorshipTierPricing(symposiumId || undefined);
  const { settings, isLoading: settingsLoading } = useSymposiumSettings();
  const updateSettings = useUpdateSymposiumSettings();
  const [editing, setEditing] = useState<EditState | null>(null);

  const rows = useMemo(() => mergeTierPricingRows(pricing), [pricing]);
  const tiers = useMemo(() => rows.map(pricingRowToTierConfig), [rows]);

  const openEdit = (row: SponsorshipTierPricingDto) => {
    const config = pricingRowToTierConfig(row);
    setEditing({
      ...normalizeTierConfig(config),
      boothSize: row.benefits?.boothSize ?? "",
      amountRwf: row.amountRwf,
    });
  };

  const save = async () => {
    if (!editing || !settings) return;
    const normalized = normalizeTierConfig(editing);
    const slug = tierLabelToSlug(editing.tier);
    const baseRows = settings.sponsorship?.tierPricing ?? rows;
    const merged = mergeTierPricingRows(
      baseRows.map((r) => ({
        tier: r.tier,
        amountUsd: r.amountUsd,
        amountRwf: r.amountRwf,
        benefits: r.benefits,
      })),
    );

    const nextPricing = merged.map((p) =>
      p.tier === slug
        ? {
            tier: slug,
            amountUsd: normalized.baseFeeUsd,
            amountRwf: editing.amountRwf,
            benefits: tierConfigToBenefitsDto(normalized, editing.boothSize || null),
          }
        : {
            tier: p.tier,
            amountUsd: p.amountUsd,
            amountRwf: p.amountRwf,
            benefits: p.benefits,
          },
    );

    try {
      await updateSettings.mutateAsync({
        sponsorship: {
          ...settings.sponsorship,
          tierPricing: nextPricing,
        },
      });
      toast.success(`${editing.tier} tier saved to symposium settings`);
      setEditing(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  if (pricingLoading || settingsLoading) {
    return <p className="text-sm text-muted-foreground">Loading tier benefits from API…</p>;
  }

  const previewBenefits = editing ? buildTierBenefitsList(editing) : [];

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        Benefits and pricing are stored in symposium settings and exposed on the public apply form.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((t) => {
          const tier = normalizeTierConfig(t);
          const row = rows.find((r) => tierSlugToLabel(r.tier) === tier.tier);
          return (
            <div key={t.tier} className="rounded-2xl bg-card border p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(t.tier)}`}>
                  {t.tier}
                </span>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => row && openEdit(row)} title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs flex-1">
                {tier.benefits.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-1">
                <div>
                  {tier.staffPasses} staff passes · {tier.brochureSlots} brochure slots
                </div>
                <div>
                  ${tier.baseFeeUsd.toLocaleString()} · +${tier.extraStaffFeeUsd}/extra staff
                </div>
                <div>
                  RWF {row?.amountRwf.toLocaleString() ?? "0"}
                </div>
                <div>{tierBenefitSummary(tier)}</div>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => row && openEdit(row)}>
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
          </DialogHeader>
          {editing && (
            <div className="space-y-6">
              <div>
                <Label>Booth size (included in tier)</Label>
                <Input
                  value={editing.boothSize}
                  onChange={(e) => setEditing({ ...editing, boothSize: e.target.value })}
                  placeholder="e.g. 6×3 m"
                  className="mt-1"
                />
              </div>
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
                    <Label>Base fee (USD)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editing.baseFeeUsd}
                      onChange={(e) => setEditing({ ...editing, baseFeeUsd: Number(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Base fee (RWF)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editing.amountRwf}
                      onChange={(e) => setEditing({ ...editing, amountRwf: Number(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Extra staff fee (USD)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editing.extraStaffFeeUsd}
                      onChange={(e) => setEditing({ ...editing, extraStaffFeeUsd: Number(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-secondary/40 p-4">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Preview</p>
                <ul className="text-sm space-y-1">
                  {previewBenefits.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={updateSettings.isPending} className="gradient-blue text-accent-foreground">
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving…
                </>
              ) : (
                "Save to API"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
