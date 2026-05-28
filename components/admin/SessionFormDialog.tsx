import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUB_THEMES, type Session, type SubTheme } from "@/lib/mock-data";
import { getRooms } from "@/lib/platform-settings";
import { useStore } from "@/hooks/use-store";
import { upsertSession } from "@/lib/programme-sync";
import { uid } from "@/lib/store";
import { toast } from "sonner";

const SESSION_TYPES: Session["type"][] = ["Plenary", "Panel", "Workshop", "Field Visit", "Keynote"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session | null;
  onSaved?: () => void;
};

export function SessionFormDialog({ open, onOpenChange, session, onSaved }: Props) {
  const store = useStore();
  const rooms = getRooms();
  const speakers = store.speakerProfiles;

  const empty = (): Session => ({
    id: uid("ss"),
    day: 1,
    start: "09:00",
    end: "10:00",
    title: "",
    type: "Plenary",
    room: rooms[0]?.name ?? "Grand Ballroom",
    subTheme: SUB_THEMES[0],
    speakers: [],
    description: "",
    longDescription: "",
  });

  const [form, setForm] = useState<Session>(session ?? empty());

  useEffect(() => {
    if (open) setForm(session ?? empty());
  }, [open, session]);

  const toggleSpeaker = (id: string) => {
    setForm((f) => ({
      ...f,
      speakers: f.speakers.includes(id) ? f.speakers.filter((s) => s !== id) : [...f.speakers, id],
    }));
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title required");
    upsertSession(form);
    toast.success(session ? "Session updated" : "Session created");
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session ? "Edit session" : "New session"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label>Day</Label>
              <Select value={String(form.day)} onValueChange={(v: string) => setForm({ ...form, day: Number(v) as 1 | 2 })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">Day 1</SelectItem><SelectItem value="2">Day 2</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Start</Label><Input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="mt-1" /></div>
            <div><Label>End</Label><Input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="mt-1" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v: string) => setForm({ ...form, type: v as Session["type"] })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SESSION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room</Label>
              <Select value={form.room} onValueChange={(v: string) => setForm({ ...form, room: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{rooms.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Sub-theme</Label>
            <Select value={form.subTheme} onValueChange={(v: string) => setForm({ ...form, subTheme: v as SubTheme })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{SUB_THEMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Speakers</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
              {speakers.map((s) => (
                <label key={s.id} className="text-xs flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={form.speakers.includes(s.id)} onChange={() => toggleSpeaker(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div><Label>Short description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
          <div><Label>Full description</Label><Textarea rows={3} value={form.longDescription ?? ""} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} className="mt-1" /></div>
          <div><Label>Capacity</Label><Input type="number" value={form.capacity ?? ""} onChange={(e) => setForm({ ...form, capacity: e.target.value ? Number(e.target.value) : undefined })} className="mt-1" /></div>
          <DialogFooter>
            <Button type="submit" className="gradient-blue text-accent-foreground">Save session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
