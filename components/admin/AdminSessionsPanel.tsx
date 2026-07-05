"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SessionEditorFields,
  normalizeSessionForm,
  validateSessionForm,
} from "@/components/programme/SessionEditorFields";
import { useAdminSessions, useCreateSession, useDeleteSession, useUpdateSession } from "@/hooks/api/useAdmin";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import type { SessionDto } from "@/lib/api/dto";
import { SUB_THEMES, type Session } from "@/lib/mock-data";
import { getRooms } from "@/lib/platform-settings";
import {
  apiSessionToForm,
  persistSessionExtras,
  sessionFormToApiDto,
  sessionFormToUpdateDto,
} from "@/lib/session-admin-bridge";
import { deleteSessionExtras } from "@/lib/session-extras-storage";
import { upsertSession, deleteSession as deleteLocalSession } from "@/lib/programme-sync";
import { uid } from "@/lib/store";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";

export type SessionDayFilter = "all" | 1 | 2;

type Props = {
  dayFilter: SessionDayFilter;
};

function emptySession(): Session {
  const rooms = getRooms();
  return {
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
    learningObjectives: [""],
    capacity: rooms[0]?.capacity ?? 100,
    visibility: "public",
  };
}

export function AdminSessionsPanel({ dayFilter }: Props) {
  const symposiumId = useSymposiumId();
  const apiDay = dayFilter === "all" ? undefined : dayFilter;
  const { sessions: apiSessions, isLoading, isError } = useAdminSessions({ limit: 200, day: apiDay });
  const create = useCreateSession();
  const update = useUpdateSession();
  const remove = useDeleteSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Session>(emptySession);

  const sessions = useMemo(() => {
    const mapped = apiSessions.map(apiSessionToForm);
    if (dayFilter === "all") return mapped;
    return mapped.filter((s) => s.day === dayFilter);
  }, [apiSessions, dayFilter]);

  const openCreate = () => {
    const next = emptySession();
    if (dayFilter === 1 || dayFilter === 2) next.day = dayFilter;
    setForm(next);
    setOpen(true);
  };

  useAdminCommandAction({ "add-session": openCreate });

  const openEdit = (dto: SessionDto) => {
    setForm(apiSessionToForm(dto));
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId) return toast.error("Symposium not loaded");
    const err = validateSessionForm(form);
    if (err) return toast.error(err);

    const normalized = normalizeSessionForm(form);
    const onDone = {
      onSuccess: (saved: SessionDto) => {
        const withId = { ...normalized, id: saved.id };
        persistSessionExtras(withId);
        upsertSession(withId);
        toast.success(form.id && !form.id.startsWith("ss-temp") && apiSessions.some((s) => s.id === form.id) ? "Session updated" : "Session created");
        setOpen(false);
      },
      onError: (err: Error) => toast.error(err.message),
    };

    const isEdit = apiSessions.some((s) => s.id === form.id);
    if (isEdit) {
      update.mutate({ id: form.id, dto: sessionFormToUpdateDto(normalized, symposiumId) }, onDone);
    } else {
      create.mutate(sessionFormToApiDto(normalized, symposiumId), onDone);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this session? It will be removed from run-of-show too.")) return;
    remove.mutate(id, {
      onSuccess: () => {
        deleteLocalSession(id);
        deleteSessionExtras(id);
        toast.success("Session deleted");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          {dayFilter !== "all" ? ` · Day ${dayFilter}` : ""}
        </p>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add session
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading sessions…</p>}
      {isError && <p className="text-sm text-destructive">Could not load sessions from API.</p>}

      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Day</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Room</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No sessions for this filter.
                </td>
              </tr>
            )}
            {sessions.map((s) => {
              const dto = apiSessions.find((a) => a.id === s.id);
              if (!dto) return null;
              return (
                <tr key={s.id} className="border-t hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">{s.title}</td>
                  <td className="px-4 py-3">Day {s.day}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {s.start}–{s.end}
                  </td>
                  <td className="px-4 py-3">{s.room || "—"}</td>
                  <td className="px-4 py-3 text-xs">{dto.isPublished ? "Published" : "Draft"}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(dto)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Rich fields (learning objectives, sub-theme, capacity, visibility) are saved locally until the backend extends{" "}
        <code className="text-[10px]">SessionDto</code>.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{apiSessions.some((s) => s.id === form.id) ? "Edit session" : "New session"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <SessionEditorFields form={form} onChange={setForm} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-blue text-accent-foreground" disabled={create.isPending || update.isPending}>
                Save session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ProgrammeDayFilter({
  value,
  onChange,
  className,
}: {
  value: SessionDayFilter;
  onChange: (v: SessionDayFilter) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <Select value={String(value)} onValueChange={(v) => onChange(v === "all" ? "all" : (Number(v) as 1 | 2))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by day" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All days</SelectItem>
          <SelectItem value="1">Day 1 · 13 Aug</SelectItem>
          <SelectItem value="2">Day 2 · 14 Aug</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
