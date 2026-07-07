"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useAdminExhibitorPackages,
  useCreateExhibitorPackage,
  useRemoveExhibitorPackage,
  useUpdateExhibitorPackage,
} from "@/hooks/api/useExhibitor";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import type { ExhibitorPackageDto } from "@/lib/api/dto";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PackageForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  staffPassQuota: number;
  boothSize: string;
  priceUsd: number;
  isActive: boolean;
  sortOrder: number;
};

const emptyForm = (): PackageForm => ({
  name: "",
  slug: "",
  description: "",
  staffPassQuota: 2,
  boothSize: "",
  priceUsd: 0,
  isActive: true,
  sortOrder: 0,
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function fromPackage(pkg: ExhibitorPackageDto): PackageForm {
  return {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description ?? "",
    staffPassQuota: pkg.staffPassQuota,
    boothSize: pkg.boothSize ?? "",
    priceUsd: Number(pkg.priceUsd),
    isActive: pkg.isActive,
    sortOrder: pkg.sortOrder,
  };
}

export function ExhibitorPackagesPanel() {
  const symposiumId = useSymposiumId();
  const { packages, isLoading, isError } = useAdminExhibitorPackages(symposiumId ?? undefined);
  const create = useCreateExhibitorPackage();
  const update = useUpdateExhibitorPackage();
  const remove = useRemoveExhibitorPackage();
  const [editing, setEditing] = useState<PackageForm | null>(null);

  const sorted = [...packages].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const openNew = () => setEditing(emptyForm());
  const openEdit = (pkg: ExhibitorPackageDto) => setEditing(fromPackage(pkg));

  const save = async () => {
    if (!editing || !symposiumId) return;
    if (!editing.name.trim()) return toast.error("Package name is required");

    const slug = editing.slug.trim() || slugify(editing.name);
    const payload = {
      name: editing.name.trim(),
      slug,
      description: editing.description.trim() || undefined,
      staffPassQuota: editing.staffPassQuota,
      boothSize: editing.boothSize.trim() || undefined,
      priceUsd: editing.priceUsd,
      isActive: editing.isActive,
      sortOrder: editing.sortOrder,
    };

    try {
      if (editing.id) {
        await update.mutateAsync({ id: editing.id, dto: payload });
        toast.success("Booth package updated");
      } else {
        await create.mutateAsync({ symposiumId, ...payload });
        toast.success("Booth package created");
      }
      setEditing(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const onDelete = async (pkg: ExhibitorPackageDto) => {
    if (!confirm(`Delete package "${pkg.name}"?`)) return;
    try {
      await remove.mutateAsync(pkg.id);
      toast.success("Booth package deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5" /> Booth packages
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Catalog shown on the public apply form when applicants choose <strong>Exhibitor</strong>. Sponsorship tiers
            are configured separately under Tier benefits and symposium settings.
          </p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openNew}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add package
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading booth packages…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Could not load booth packages — check API permissions.</p>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No booth packages yet. Add at least one so exhibitor applications can be priced on{" "}
          <code className="text-xs">/dashboard/apply-exhibit</code>.
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto bg-card">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Package</th>
                <th className="text-left px-4 py-3">Booth size</th>
                <th className="text-left px-4 py-3">Staff passes</th>
                <th className="text-left px-4 py-3">Price (USD)</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pkg) => (
                <tr key={pkg.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{pkg.name}</div>
                    {pkg.description ? (
                      <div className="text-xs text-muted-foreground line-clamp-1">{pkg.description}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs">{pkg.boothSize || "—"}</td>
                  <td className="px-4 py-3">{pkg.staffPassQuota}</td>
                  <td className="px-4 py-3 font-mono">${Number(pkg.priceUsd).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                        pkg.isActive ? "bg-green/15 text-green" : "bg-zinc-200 text-zinc-700",
                      )}
                    >
                      {pkg.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(pkg)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(pkg)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit booth package" : "New booth package"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4 py-2">
              <div>
                <Label>Name *</Label>
                <Input
                  placeholder="e.g. Standard booth"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      name: e.target.value,
                      slug: editing.slug || slugify(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  placeholder="e.g. standard-booth"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="What's included in this booth package…"
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Booth size</Label>
                  <Input
                    placeholder="e.g. 3m × 3m"
                    value={editing.boothSize}
                    onChange={(e) => setEditing({ ...editing, boothSize: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Staff passes included</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 2"
                    value={editing.staffPassQuota}
                    onChange={(e) =>
                      setEditing({ ...editing, staffPassQuota: Math.max(0, parseInt(e.target.value, 10) || 0) })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Price (USD) *</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 2200"
                    value={editing.priceUsd || ""}
                    onChange={(e) => setEditing({ ...editing, priceUsd: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 0"
                    value={editing.sortOrder}
                    onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <Label htmlFor="pkg-active" className="cursor-pointer">
                  Published on apply form
                </Label>
                <Switch
                  id="pkg-active"
                  checked={editing.isActive}
                  onCheckedChange={(v) => setEditing({ ...editing, isActive: v })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              className="gradient-blue text-accent-foreground"
              onClick={save}
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending ? "Saving…" : "Save package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
