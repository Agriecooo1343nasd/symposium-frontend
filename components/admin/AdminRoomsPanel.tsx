"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from "@/hooks/api/useProgramme";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import type { VenueRoomDto } from "@/lib/api/dto";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

type RoomForm = { name: string; capacity: number; floor: string; avSetup: string };

const emptyRoom = (): RoomForm => ({
  name: "",
  capacity: 100,
  floor: "Ground floor",
  avSetup: "",
});

export function AdminRoomsPanel() {
  const symposiumId = useSymposiumId();
  const { rooms, isLoading } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VenueRoomDto | null>(null);
  const [form, setForm] = useState<RoomForm>(emptyRoom());

  const saving = createRoom.isPending || updateRoom.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyRoom());
    setOpen(true);
  };

  const openEdit = (room: VenueRoomDto) => {
    setEditing(room);
    setForm({
      name: room.name,
      capacity: room.capacity ?? 0,
      floor: room.floor ?? "",
      avSetup: room.avSetup ?? "",
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) return toast.error("Room name is required");
    if (!form.capacity || form.capacity < 1) return toast.error("Capacity must be at least 1");

    const payload = {
      name: form.name.trim(),
      capacity: Number(form.capacity),
      floor: form.floor.trim() || undefined,
      avSetup: form.avSetup.trim() || undefined,
    };

    try {
      if (editing) {
        await updateRoom.mutateAsync({ id: editing.id, dto: payload });
        toast.success("Room updated");
      } else {
        if (!symposiumId) return toast.error("Symposium not loaded yet");
        await createRoom.mutateAsync({ symposiumId, ...payload });
        toast.success("Room added");
      }
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const remove = async (room: VenueRoomDto) => {
    if (!confirm(`Remove "${room.name}"? Sessions using this room keep the name as text.`)) return;
    try {
      await deleteRoom.mutateAsync(room.id);
      toast.success("Room removed");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-xl">
          Venue rooms for session assignment and run-of-show.
        </p>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add room
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading rooms…
        </div>
      ) : rooms.length === 0 ? (
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
              {rooms.map((r) => (
                <tr key={r.id} className="border-t hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.capacity ?? "—"}</td>
                  <td className="px-4 py-3">{r.floor || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.avSetup || "—"}</td>
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
                value={form.avSetup}
                onChange={(e) => setForm({ ...form, avSetup: e.target.value })}
                className="mt-1"
                placeholder="e.g. Projector, PA, 4× wireless mics, HDMI"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-blue text-accent-foreground" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Add room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
