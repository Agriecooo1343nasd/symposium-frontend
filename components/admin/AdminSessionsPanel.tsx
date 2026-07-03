"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSessions, useCreateSession, useDeleteSession, useUpdateSession } from "@/hooks/api/useAdmin";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import type { SessionDto } from "@/lib/api/dto";
import {
  API_SESSION_TYPES,
  DEFAULT_SESSION_TYPE,
  sessionTypeLabel,
  type ApiSessionType,
} from "@/lib/api/session-types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Form = {
  id?: string;
  title: string;
  description: string;
  dayIndex: number;
  room: string;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  sessionType: ApiSessionType;
};

const empty = (): Form => ({
  title: "",
  description: "",
  dayIndex: 1,
  room: "",
  startTime: "",
  endTime: "",
  isPublished: true,
  sessionType: DEFAULT_SESSION_TYPE,
});

function normalizeSessionType(value?: string | null): ApiSessionType {
  const v = (value ?? "").toLowerCase();
  return (API_SESSION_TYPES as readonly string[]).includes(v) ? (v as ApiSessionType) : DEFAULT_SESSION_TYPE;
}

function fromSession(s: SessionDto): Form {
  return {
    id: s.id,
    title: s.title,
    description: s.description ?? "",
    dayIndex: s.dayIndex ?? 1,
    room: s.room ?? "",
    startTime: s.startTime?.slice(0, 16) ?? "",
    endTime: s.endTime?.slice(0, 16) ?? "",
    isPublished: s.isPublished,
    sessionType: normalizeSessionType(s.sessionType),
  };
}

export function AdminSessionsPanel() {
  const symposiumId = useSymposiumId();
  const { sessions, isLoading } = useAdminSessions({ limit: 200 });
  const create = useCreateSession();
  const update = useUpdateSession();
  const remove = useDeleteSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty());

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId || !form.title.trim()) return toast.error("Title required");
    const dto = {
      symposiumId,
      title: form.title.trim(),
      description: form.description || undefined,
      dayIndex: form.dayIndex,
      room: form.room || undefined,
      startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
      endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
      isPublished: form.isPublished,
      sessionType: form.sessionType,
    };
    const onDone = {
      onSuccess: () => { toast.success("Session saved"); setOpen(false); },
      onError: (err: Error) => toast.error(err.message),
    };
    if (form.id) update.mutate({ id: form.id, dto }, onDone);
    else create.mutate(dto, onDone);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{sessions.length} sessions</p>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => { setForm(empty()); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add session
        </Button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading sessions…</p>}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Day</th>
              <th className="text-left px-4 py-3">Room</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 font-medium">{s.title}</td>
                <td className="px-4 py-3">Day {s.dayIndex ?? "—"}</td>
                <td className="px-4 py-3">{s.room ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{s.isPublished ? "Published" : "Draft"}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => { setForm(fromSession(s)); setOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      remove.mutate(s.id, {
                        onSuccess: () => toast.success("Deleted"),
                        onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit session" : "New session"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Session type</Label>
                <Select
                  value={form.sessionType}
                  onValueChange={(v) => setForm({ ...form, sessionType: v as ApiSessionType })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {API_SESSION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {sessionTypeLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Day index</Label>
                <Input type="number" min={1} value={form.dayIndex} onChange={(e) => setForm({ ...form, dayIndex: Number(e.target.value) || 1 })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Room</Label>
              <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start</Label>
                <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>End</Label>
                <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={create.isPending || update.isPending}>Save session</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
