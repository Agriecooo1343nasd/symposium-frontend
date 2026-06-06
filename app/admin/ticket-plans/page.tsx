"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, DollarSign, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type TicketPlan } from "@/lib/store";
import { countRegistrationsForPlan } from "@/lib/registration-ops";
import { formatPrice } from "@/components/CurrencyToggle";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { cn } from "@/lib/utils";

const emptyPlan = (): TicketPlan => ({
  id: uid("plan"),
  name: "",
  subtitle: "",
  usd: 0,
  description: "",
  features: [],
  popular: false,
  requiresVerification: null,
  capacity: 100,
  soldOutOverride: false,
  note: "",
});

export default function Page() {
  const store = useStore();
  const rate = store.platformSettings.exchangeRate;
  const [editing, setEditing] = useState<TicketPlan | null>(null);
  const [featuresText, setFeaturesText] = useState("");

  const plans = [...store.ticketPlans]
    .filter((t) => !t.isMediaAccreditation)
    .sort((a, b) => b.usd - a.usd);

  const openEdit = (plan: TicketPlan) => {
    setEditing({ ...plan });
    setFeaturesText(plan.features.join("\n"));
  };

  const openNew = () => {
    setEditing(emptyPlan());
    setFeaturesText("");
  };

  useAdminCommandAction({
    "add-plan": openNew,
  });

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Plan name is required");
    const plan: TicketPlan = {
      ...editing,
      name: editing.name.trim(),
      features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
    };
    patchStore((s) => {
      const exists = s.ticketPlans.some((t) => t.id === plan.id);
      return {
        ...s,
        ticketPlans: exists ? s.ticketPlans.map((t) => (t.id === plan.id ? plan : t)) : [...s.ticketPlans, plan],
      };
    });
    toast.success("Fees updated — visible on the registration page");
    setEditing(null);
  };

  const remove = (id: string) => {
    if (countRegistrationsForPlan(id) > 0) {
      return toast.error("Cannot remove a plan that already has registrations");
    }
    patchStore((s) => ({ ...s, ticketPlans: s.ticketPlans.filter((t) => t.id !== id) }));
    toast.success("Plan removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Registration fees &amp; pass plans</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Set delegate pass prices, features, and capacity. Changes apply immediately on the public{" "}
            <Link href="/register" target="_blank" className="text-accent hover:underline">
              registration page
            </Link>{" "}
            and homepage pricing section.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" variant="outline" asChild>
            <Link href="/register" target="_blank">
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview register page
            </Link>
          </Button>
          <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openNew}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add pass plan
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/5 to-secondary/30 p-4 sm:p-5 flex flex-wrap items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 shrink-0">
          <DollarSign className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm font-semibold">USD → RWF conversion</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Registration shows both currencies using rate{" "}
            <span className="font-mono font-medium text-foreground">1 USD = {rate.toLocaleString()} RWF</span>
          </div>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/settings">Edit exchange rate</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((t) => {
          const sold = countRegistrationsForPlan(t.id);
          const atCapacity = sold >= t.capacity || t.soldOutOverride;
          return (
            <div
              key={t.id}
              className={cn(
                "rounded-2xl bg-card border p-5 flex flex-col hover-lift",
                t.popular ? "border-accent ring-1 ring-accent/20" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                  <Ticket className="h-4 w-4 text-accent" />
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(t.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {t.popular && (
                <span className="text-[10px] uppercase font-bold text-accent mb-1">Popular on register page</span>
              )}
              <div className="font-serif font-bold text-lg leading-tight">{t.name}</div>
              {t.subtitle && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.subtitle}</div>}

              <div className="mt-3">
                <div className="font-serif text-2xl sm:text-3xl font-bold text-gradient">
                  {t.usd === 0 ? "Free" : formatPrice(t.usd, "USD", rate)}
                </div>
                {t.usd > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">≈ {formatPrice(t.usd, "RWF", rate)}</div>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                {sold} / {t.capacity} registrations
                {atCapacity && <span className="text-amber-700 font-semibold"> · Sold out</span>}
              </div>

              {t.note && (
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-2">
                  {t.note}
                </div>
              )}

              {t.requiresVerification && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mt-2 inline-block w-fit">
                  Requires {t.requiresVerification} verification
                </span>
              )}

              <p className="text-xs text-muted-foreground mt-3 line-clamp-2 flex-1">{t.description}</p>

              <ul className="mt-3 space-y-1 text-xs border-t border-border pt-3">
                {t.features.slice(0, 3).map((f) => (
                  <li key={f} className="text-muted-foreground line-clamp-1">
                    • {f}
                  </li>
                ))}
                {t.features.length > 3 && (
                  <li className="text-muted-foreground/70">+{t.features.length - 3} more</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {plans.length === 0 && (
        <p className="text-center py-12 text-muted-foreground text-sm">No delegate pass plans yet. Add one to show pricing on /register.</p>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing && store.ticketPlans.some((t) => t.id === editing.id) ? "Edit pass plan & fees" : "New pass plan"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              This plan appears on step 2 of the registration flow when delegates choose their pass.
            </p>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Pass name *</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="mt-1"
                  placeholder="International Delegate"
                />
              </div>
              <div>
                <Label>Short subtitle (optional)</Label>
                <Input
                  value={editing.subtitle ?? ""}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  className="mt-1"
                  placeholder="Shown under the plan name on cards"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Fee (USD) *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={editing.usd}
                    onChange={(e) => setEditing({ ...editing, usd: Math.max(0, Number(e.target.value) || 0) })}
                    className="mt-1"
                  />
                  {editing.usd > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      ≈ {formatPrice(editing.usd, "RWF", rate)} on register page
                    </p>
                  )}
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.capacity}
                    onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1"
                  rows={2}
                  placeholder="One-line summary on the pass card"
                />
              </div>
              <div>
                <Label>Footnote / badge (optional)</Label>
                <Input
                  value={editing.note ?? ""}
                  onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                  className="mt-1"
                  placeholder="e.g. Requires valid student ID"
                />
              </div>
              <div>
                <Label>Included benefits (one per line)</Label>
                <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="mt-1" rows={4} />
              </div>
              <div>
                <Label>Verification required</Label>
                <Select
                  value={editing.requiresVerification ?? "none"}
                  onValueChange={(v) =>
                    setEditing({
                      ...editing,
                      requiresVerification: v === "none" ? null : (v as "student" | "farmer"),
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="student">Student ID</SelectItem>
                    <SelectItem value="farmer">Organization letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                  <Switch checked={!!editing.popular} onCheckedChange={(c) => setEditing({ ...editing, popular: c })} />
                  <Label>Highlight as popular</Label>
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={!!editing.soldOutOverride}
                    onCheckedChange={(c) => setEditing({ ...editing, soldOutOverride: c })}
                  />
                  <Label>Force sold out (waitlist)</Label>
                </label>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={save} className="gradient-blue text-accent-foreground">
                  Save &amp; publish to register page
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
