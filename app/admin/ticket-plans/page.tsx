"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, DollarSign, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import { formatPrice } from "@/components/CurrencyToggle";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { cn } from "@/lib/utils";
import {
  useAdminTicketCategories,
  useCreateTicketCategory,
  useDeleteTicketCategory,
  useUpdateTicketCategory,
} from "@/hooks/api/useAdmin";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import type { TicketCategoryDto } from "@/lib/api/dto";

type PlanForm = {
  id?: string;
  name: string;
  description: string;
  usd: number;
  capacity: number;
  requiresVerification: boolean;
  isActive: boolean;
  sortOrder: number;
  featuresText: string;
};

const emptyForm = (): PlanForm => ({
  name: "",
  description: "",
  usd: 0,
  capacity: 100,
  requiresVerification: false,
  isActive: true,
  sortOrder: 0,
  featuresText: "",
});

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
}

function toBenefits(text: string) {
  return text
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean)
    .map((label) => ({ label }));
}

function fromCategory(c: TicketCategoryDto): PlanForm {
  const features =
    c.benefits?.flatMap((b) => {
      if (typeof b === "object" && b && "label" in b) return [String((b as { label: string }).label)];
      return [];
    }) ?? [];
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? "",
    usd: c.priceUsd,
    capacity: c.capacity ?? 100,
    requiresVerification: c.requiresVerification,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    featuresText: features.join("\n"),
  };
}

export default function Page() {
  const store = useStore();
  const rate = store.platformSettings.exchangeRate;
  const symposiumId = useSymposiumId();
  const { categories, isLoading, isError } = useAdminTicketCategories();
  const create = useCreateTicketCategory();
  const update = useUpdateTicketCategory();
  const remove = useDeleteTicketCategory();
  const [editing, setEditing] = useState<PlanForm | null>(null);

  const plans = [...categories].sort((a, b) => b.priceUsd - a.priceUsd);

  const openEdit = (plan: TicketCategoryDto) => setEditing(fromCategory(plan));
  const openNew = () => setEditing(emptyForm());

  useAdminCommandAction({ "add-plan": openNew });

  const save = () => {
    if (!editing || !symposiumId) return;
    if (!editing.name.trim()) return toast.error("Plan name is required");
    const current = editing.id ? categories.find((c) => c.id === editing.id) : null;
    const soldCount = current?.soldCount ?? 0;
    const capacity = editing.capacity > 0 ? editing.capacity : undefined;
    if (capacity !== undefined && soldCount > capacity) {
      return toast.error(`Capacity cannot be lower than sold seats (${soldCount})`);
    }
    const dto = {
      symposiumId,
      name: editing.name.trim(),
      slug: slugify(editing.name),
      description: editing.description || undefined,
      priceUsd: editing.usd,
      priceRwf: Math.round(editing.usd * rate),
      requiresVerification: editing.requiresVerification,
      capacity,
      isActive: editing.isActive,
      isSoldOut: capacity !== undefined ? soldCount >= capacity : false,
      sortOrder: editing.sortOrder,
      benefits: toBenefits(editing.featuresText),
    };
    const onDone = {
      onSuccess: () => {
        toast.success("Pass plan saved");
        setEditing(null);
      },
      onError: (e: Error) => toast.error(e.message),
    };
    if (editing.id) {
      update.mutate({ id: editing.id, dto }, onDone);
    } else {
      create.mutate(dto, onDone);
    }
  };

  const onRemove = (id: string, soldCount: number) => {
    if (soldCount > 0) return toast.error("Cannot remove a plan that already has registrations");
    remove.mutate(id, {
      onSuccess: () => toast.success("Plan removed"),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Registration fees &amp; pass plans</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
           . Changes apply on the public{" "}
            <Link href="/register" target="_blank" className="text-accent hover:underline">
              registration page
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
         
          <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openNew}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add pass plan
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading ticket categories…</p>}
      {isError && <p className="text-sm text-destructive">Could not load ticket categories.</p>}

      <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/5 to-secondary/30 p-4 sm:p-5 flex flex-wrap items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 shrink-0">
          <DollarSign className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm font-semibold">USD → RWF conversion</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            RWF price saved as <span className="font-mono">priceRwf</span> using rate 1 USD = {rate.toLocaleString()} RWF
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((t) => {
          const sold = t.soldCount ?? 0;
          const cap = t.capacity ?? 0;
          const atCapacity = cap > 0 && sold >= cap;
          return (
            <div
              key={t.id}
              className={cn(
                "rounded-2xl bg-card border p-5 flex flex-col hover-lift",
                t.sortOrder === 1 ? "border-accent ring-1 ring-accent/20" : "border-border",
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
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onRemove(t.id, sold)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="font-serif font-bold text-lg leading-tight">{t.name}</div>
              <div className="mt-3">
                <div className="font-serif text-2xl sm:text-3xl font-bold text-gradient">
                  {t.priceUsd === 0 ? "Free" : formatPrice(t.priceUsd, "USD", rate)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {sold} / {cap || "∞"} sold · {t.isActive ? "active" : "inactive"}
                {atCapacity && <span className="text-amber-700 font-semibold"> · Sold out</span>}
              </div>
              {t.requiresVerification && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mt-2 inline-block w-fit">
                  Requires verification
                </span>
              )}
              <p className="text-xs text-muted-foreground mt-3 line-clamp-2 flex-1">{t.description}</p>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit pass plan" : "New pass plan"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Pass name *</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fee (USD) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.usd}
                    onChange={(e) => setEditing({ ...editing, usd: Math.max(0, Number(e.target.value) || 0) })}
                    className="mt-1"
                  />
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
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1" rows={2} />
              </div>
              <div>
                <Label>Benefits (one per line)</Label>
                <Textarea value={editing.featuresText} onChange={(e) => setEditing({ ...editing, featuresText: e.target.value })} className="mt-1" rows={4} />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                  <Switch checked={editing.requiresVerification} onCheckedChange={(c) => setEditing({ ...editing, requiresVerification: c })} />
                  <Label>Requires verification</Label>
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={editing.isActive} onCheckedChange={(c) => setEditing({ ...editing, isActive: c })} />
                  <Label>Active on register page</Label>
                </label>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save} className="gradient-blue text-accent-foreground" disabled={create.isPending || update.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
