"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { toast } from "sonner";


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
});

export default function Page() {
  const store = useStore();
  const [editing, setEditing] = useState<TicketPlan | null>(null);
  const [featuresText, setFeaturesText] = useState("");

  const openEdit = (plan: TicketPlan) => {
    setEditing({ ...plan });
    setFeaturesText(plan.features.join("\n"));
  };

  const openNew = () => {
    const p = emptyPlan();
    setEditing(p);
    setFeaturesText("");
  };

  const save = () => {
    if (!editing) return;
    const plan = { ...editing, features: featuresText.split("\n").filter(Boolean) };
    patchStore((s) => {
      const exists = s.ticketPlans.some((t) => t.id === plan.id);
      return {
        ...s,
        ticketPlans: exists ? s.ticketPlans.map((t) => (t.id === plan.id ? plan : t)) : [...s.ticketPlans, plan],
      };
    });
    toast.success("Pass plan saved");
    setEditing(null);
  };

  const remove = (id: string) => {
    patchStore((s) => ({ ...s, ticketPlans: s.ticketPlans.filter((t) => t.id !== id) }));
    toast.success("Plan removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Registration pass plans</h1>
          <p className="text-muted-foreground">Manage pricing, features, and verification requirements.</p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openNew}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add plan
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.ticketPlans.map((t) => (
          <div key={t.id} className="rounded-2xl bg-card border border-border p-5">
            {t.popular && (
              <span className="text-[10px] uppercase font-bold text-accent">Popular</span>
            )}
            <div className="font-serif font-bold text-lg">{t.name}</div>
            {t.subtitle && <div className="text-xs text-muted-foreground">{t.subtitle}</div>}
            <div className="font-serif text-2xl font-bold mt-2">${t.usd}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {countRegistrationsForPlan(t.id)} / {t.capacity} sold{t.soldOutOverride ? " · forced sold out" : ""}
            </div>
            {t.requiresVerification && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mt-2 inline-block">
                Requires {t.requiresVerification} verification
              </span>
            )}
            <ul className="mt-3 space-y-1 text-xs">
              {t.features.slice(0, 4).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{store.ticketPlans.some((t) => t.id === editing?.id) ? "Edit" : "New"} pass plan</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (USD)</Label>
                  <Input type="number" value={editing.usd} onChange={(e) => setEditing({ ...editing, usd: Number(e.target.value) })} className="mt-1" />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input type="number" min={0} value={editing.capacity} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) || 0 })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1" rows={2} />
              </div>
              <div>
                <Label>Features (one per line)</Label>
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
                  <Label>Popular</Label>
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={!!editing.soldOutOverride} onCheckedChange={(c) => setEditing({ ...editing, soldOutOverride: c })} />
                  <Label>Force sold out (waitlist)</Label>
                </label>
              </div>
              <DialogFooter>
                <Button onClick={save} className="gradient-blue text-accent-foreground">
                  Save plan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
