import { useState } from "react";
import { Plus, Pencil, Trash2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type Booth, type BoothStatus } from "@/lib/store";
import { toast } from "sonner";

const emptyDraft = (): Omit<Booth, "id" | "assignedOrgId"> => ({
  code: "",
  row: 0,
  col: 0,
  capacity: 4,
  location: "",
  status: "available",
});

export function BoothMapManager() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft());

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setOpen(true);
  };

  const openEdit = (b: Booth) => {
    setEditingId(b.id);
    setDraft({
      code: b.code,
      row: b.row,
      col: b.col,
      capacity: b.capacity,
      location: b.location || "",
      status: b.status,
    });
    setOpen(true);
  };

  const save = () => {
    if (!draft.code.trim()) return toast.error("Booth code required");
    if (editingId) {
      patchStore((s) => ({
        ...s,
        booths: s.booths.map((b) =>
          b.id === editingId
            ? { ...b, code: draft.code.trim(), row: draft.row, col: draft.col, capacity: draft.capacity, location: draft.location, status: draft.status }
            : b,
        ),
      }));
      toast.success("Booth updated");
    } else {
      const id = uid("booth");
      patchStore((s) => ({
        ...s,
        booths: [
          ...s.booths,
          {
            id,
            code: draft.code.trim(),
            row: draft.row,
            col: draft.col,
            capacity: draft.capacity,
            location: draft.location || "Exhibition hall",
            status: draft.status,
          },
        ],
      }));
      toast.success("Booth created");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    const b = store.booths.find((x) => x.id === id);
    if (b?.status === "occupied") return toast.error("Cannot delete an occupied booth");
    patchStore((s) => ({ ...s, booths: s.booths.filter((x) => x.id !== id) }));
    toast.info("Booth removed");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Map className="h-4 w-4" />
          {store.booths.length} booths · {store.booths.filter((b) => b.status === "occupied").length} occupied
        </p>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> New booth
        </Button>
      </div>

      <div className="rounded-2xl bg-card border p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {store.booths.map((b) => {
            const org = store.approvedOrganizations.find((o) => o.booth === b.code);
            return (
              <div
                key={b.id}
                className={`rounded-lg border p-2 text-center text-xs min-h-[72px] flex flex-col justify-between ${
                  b.status === "occupied"
                    ? "border-accent bg-accent/10"
                    : b.status === "reserved"
                      ? "border-amber-300 bg-amber-50"
                      : "border-border"
                }`}
              >
                <div>
                  <div className="font-bold">{b.code}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">cap {b.capacity}</div>
                  {org && <div className="truncate text-[9px] mt-1 font-medium">{org.name}</div>}
                </div>
                <div className="flex justify-center gap-0.5 mt-1">
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(b)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(b.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Capacity</th>
              <th className="text-left px-4 py-3">Grid</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.booths.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3 font-mono font-medium">{b.code}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate" title={b.location}>{b.location || "—"}</td>
                <td className="px-4 py-3">{b.capacity}</td>
                <td className="px-4 py-3 text-xs">R{b.row + 1} · C{b.col + 1}</td>
                <td className="px-4 py-3 capitalize">{b.status}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit booth" : "Create booth"}</DialogTitle>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Booth code *</Label>
              <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} placeholder="A-01" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Location / zone</Label>
              <Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Main hall · near entrance" className="mt-1" />
            </div>
            <div>
              <Label>Capacity (people)</Label>
              <Input type="number" min={1} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) || 1 })} className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v: string) => setDraft({ ...draft, status: v as BoothStatus })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Row index</Label>
              <Input type="number" min={0} value={draft.row} onChange={(e) => setDraft({ ...draft, row: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div>
              <Label>Column index</Label>
              <Input type="number" min={0} value={draft.col} onChange={(e) => setDraft({ ...draft, col: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gradient-blue text-accent-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
