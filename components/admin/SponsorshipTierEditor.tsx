import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import { patchStore, type SponsorshipTierConfig, type SponsorshipTier } from "@/lib/store";
import { toast } from "sonner";

const tierColor = (t: string) =>
  t === "Platinum" ? "bg-slate-200 text-slate-900" : t === "Gold" ? "bg-amber-100 text-amber-900" : "bg-zinc-200 text-zinc-900";

export function SponsorshipTierEditor() {
  const store = useStore();
  const [editing, setEditing] = useState<SponsorshipTierConfig | null>(null);
  const [benefitDraft, setBenefitDraft] = useState("");

  const openEdit = (t: SponsorshipTierConfig) => {
    setEditing({ ...t, benefits: [...t.benefits] });
    setBenefitDraft("");
  };

  const save = () => {
    if (!editing) return;
    patchStore((s) => ({
      ...s,
      sponsorshipTiers: s.sponsorshipTiers.map((t) => (t.tier === editing.tier ? editing : t)),
    }));
    toast.success(`${editing.tier} tier updated`);
    setEditing(null);
  };

  const removeBenefit = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, benefits: editing.benefits.filter((_, i) => i !== index) });
  };

  const addBenefit = () => {
    if (!editing || !benefitDraft.trim()) return;
    setEditing({ ...editing, benefits: [...editing.benefits, benefitDraft.trim()] });
    setBenefitDraft("");
  };

  const resetTier = (tier: SponsorshipTier) => {
    const defaults: Record<SponsorshipTier, SponsorshipTierConfig> = {
      Platinum: { tier: "Platinum", benefits: ["10 staff passes", "5 brochure slots", "Lead capture", "Speaking slot", "Homepage feature"], staffPasses: 10, brochureSlots: 5, leadCapture: true, homepageFeature: true, baseFeeUsd: 15000, extraStaffFeeUsd: 350 },
      Gold: { tier: "Gold", benefits: ["4 staff passes", "3 brochure slots", "Lead capture", "Newsletter mention"], staffPasses: 4, brochureSlots: 3, leadCapture: true, homepageFeature: false, baseFeeUsd: 8000, extraStaffFeeUsd: 400 },
      Silver: { tier: "Silver", benefits: ["2 staff passes", "1 brochure slot", "Booth listing"], staffPasses: 2, brochureSlots: 1, leadCapture: false, homepageFeature: false, baseFeeUsd: 3500, extraStaffFeeUsd: 450 },
    };
    patchStore((s) => ({
      ...s,
      sponsorshipTiers: s.sponsorshipTiers.map((t) => (t.tier === tier ? defaults[tier] : t)),
    }));
    toast.info(`${tier} reset to defaults`);
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.sponsorshipTiers.map((t) => (
          <div key={t.tier} className="rounded-2xl bg-card border p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(t.tier)}`}>{t.tier}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)} title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => resetTier(t.tier)} title="Reset">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs flex-1">
              {t.benefits.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-1">
              <div>{t.staffPasses} staff passes · ${t.baseFeeUsd} base</div>
              <div>{t.brochureSlots} brochures · +${t.extraStaffFeeUsd}/extra staff</div>
              <div>Lead capture: {t.leadCapture ? "Yes" : "No"} · Homepage: {t.homepageFeature ? "Yes" : "No"}</div>
            </div>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => openEdit(t)}>
              Edit tier
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editing?.tier} sponsorship tier</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Staff passes included</Label>
                  <Input type="number" min={0} value={editing.staffPasses} onChange={(e) => setEditing({ ...editing, staffPasses: Number(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label>Brochure slots</Label>
                  <Input type="number" min={0} value={editing.brochureSlots} onChange={(e) => setEditing({ ...editing, brochureSlots: Number(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label>Base fee (USD)</Label>
                  <Input type="number" min={0} value={editing.baseFeeUsd} onChange={(e) => setEditing({ ...editing, baseFeeUsd: Number(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label>Extra staff fee (USD)</Label>
                  <Input type="number" min={0} value={editing.extraStaffFeeUsd} onChange={(e) => setEditing({ ...editing, extraStaffFeeUsd: Number(e.target.value) || 0 })} className="mt-1" />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={editing.leadCapture} onCheckedChange={(c: boolean) => setEditing({ ...editing, leadCapture: c })} />
                  Lead capture
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={editing.homepageFeature} onCheckedChange={(c: boolean) => setEditing({ ...editing, homepageFeature: c })} />
                  Homepage feature
                </label>
              </div>
              <div>
                <Label>Benefits list</Label>
                <ul className="mt-2 space-y-1">
                  {editing.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="flex-1">{b}</span>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeBenefit(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-2">
                  <Input value={benefitDraft} onChange={(e) => setBenefitDraft(e.target.value)} placeholder="Add benefit…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())} />
                  <Button type="button" variant="outline" onClick={addBenefit}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} className="gradient-blue text-accent-foreground">Update tier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
