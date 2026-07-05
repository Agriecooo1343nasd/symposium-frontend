"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type VenueRoom } from "@/lib/store";
import { toast } from "sonner";

const emptyRoom = (): Omit<VenueRoom, "id"> => ({
  name: "",
  capacity: 100,
  floor: "Ground floor",
  av: "",
});

export function AdminRoomsPanel() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VenueRoom | null>(null);
  const [form, setForm] = useState(emptyRoom());

  const openCreate = () => {
    setEditing(null);
    setForm(emptyRoom());
    setOpen(true);
  };

  const openEdit = (room: VenueRoom) => {
    setEditing(room);
    setForm({ name: room.name, capacity: room.capacity, floor: room.floor, av: room.av });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Room name is required");
    if (!form.capacity || form.capacity < 1) return toast.error("Capacity must be at least 1");

    patchStore((s) => {
      if (editing) {
        return {
          ...s,
          rooms: s.rooms.map((r) =>
            r.id === editing.id
              ? { ...r, name: form.name.trim(), capacity: Number(form.capacity), floor: form.floor.trim(), av: form.av.trim() }
              : r,
          ),
        };
      }
      return {
        ...s,
        rooms: [...s.rooms, { id: uid("rm"), name: form.name.trim(), capacity: Number(form.capacity), floor: form.floor.trim(), av: form.av.trim() }],
      };
    });

    toast.success(editing ? "Room updated" : "Room added");
    setOpen(false);
  };

  const remove = (room: VenueRoom) => {
    if (!confirm(`Remove "${room.name}"? Sessions using this room keep the name as text.`)) return;
    patchStore((s) => ({ ...s, rooms: s.rooms.filter((r) => r.id !== room.id) }));
    toast.success("Room removed");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          Venue rooms for session assignment and run-of-show. Stored locally until a backend rooms API exists.
        </p>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add room
        </Button>
      </div>

      {store.rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-8 text-center">
          No rooms configured yet. Add your first venue space.
        </p>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Room</th>
                <th className="text-left px-4 py-3">Capacity</th>
                <th className="text-left px-4 py-3">Floor</th>
                <th className="text-left px-4 py-3">AV / setup</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.rooms.map((r) => (
                <tr key={r.id} className="border-t hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.capacity}</td>
                  <td className="px-4 py-3">{r.floor}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.av || "—"}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit room" : "Add room"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label>Room name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
                placeholder="e.g. Grand Ballroom, Workshop Room B"
              />
            </div>
            <div>
              <Label>Capacity *</Label>
              <Input
                required
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="e.g. 250"
              />
            </div>
            <div>
              <Label>Floor / level</Label>
              <Input
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="mt-1"
                placeholder="e.g. Ground floor, Level 2"
              />
            </div>
            <div>
              <Label>AV & equipment</Label>
              <Input
                value={form.av}
                onChange={(e) => setForm({ ...form, av: e.target.value })}
                className="mt-1"
                placeholder="e.g. Projector, PA, 4× wireless mics, HDMI"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-blue text-accent-foreground">
                {editing ? "Save changes" : "Add room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
