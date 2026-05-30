"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  SessionEditorFields,
  normalizeSessionForm,
  validateSessionForm,
} from "@/components/programme/SessionEditorFields";
import { SessionDetailPreview } from "@/components/programme/SessionDetailPreview";
import { saveSessionAndRunOfShow, upsertRunOfShowItem } from "@/lib/programme-sync";
import { getSessionById } from "@/lib/sessions";
import { uid, type RunOfShowItem } from "@/lib/store";
import { SUB_THEMES, SPEAKERS, type Session } from "@/lib/mock-data";
import { getRooms } from "@/lib/platform-settings";
import { toast } from "sonner";

export type RunOfShowDialogMode = "add" | "edit" | "view";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RunOfShowDialogMode;
  day: 1 | 2;
  item?: RunOfShowItem | null;
  onSaved?: () => void;
};

type ActivityKind = "session" | "break" | "custom";

function emptySession(day: 1 | 2): Session {
  const rooms = getRooms();
  return {
    id: uid("ss"),
    day,
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
    capacity: 100,
    visibility: "public",
  };
}

function emptyRos(day: 1 | 2, type: ActivityKind = "custom"): RunOfShowItem {
  return {
    id: uid("ros"),
    day,
    order: 0,
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    type,
    status: "upcoming",
  };
}

export function RunOfShowActivityDialog({ open, onOpenChange, mode, day, item, onSaved }: Props) {
  const isView = mode === "view";
  const [kind, setKind] = useState<ActivityKind>("session");
  const [sessionForm, setSessionForm] = useState<Session>(() => emptySession(day));
  const [rosForm, setRosForm] = useState<RunOfShowItem>(() => emptyRos(day));

  useEffect(() => {
    if (!open) return;
    if (!item) {
      setKind("session");
      setSessionForm(emptySession(day));
      setRosForm(emptyRos(day));
      return;
    }
    setRosForm({ ...item });
    if (item.type === "session" && item.sessionId) {
      setKind("session");
      const linked = getSessionById(item.sessionId);
      if (linked) {
        setSessionForm({ ...linked });
      } else {
        const sid = item.sessionId;
        setSessionForm({ ...emptySession(item.day), id: sid });
      }
    } else {
      setKind(item.type === "break" ? "break" : "custom");
    }
  }, [open, item, day]);

  const previewSession =
    isView && item?.sessionId
      ? getSessionById(item.sessionId)
      : kind === "session"
        ? sessionForm
        : undefined;

  const setOwner = (speakerId: string) => {
    const sp = SPEAKERS.find((s) => s.id === speakerId);
    setRosForm({
      ...rosForm,
      ownerName: sp?.name ?? "",
      ownerEmail: sp ? `${sp.id}@nas2026.rw` : "",
    });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) {
      onOpenChange(false);
      return;
    }

    if (kind === "session") {
      const err = validateSessionForm(sessionForm);
      if (err) return toast.error(err);
      const normalized = normalizeSessionForm({
        ...sessionForm,
        day,
        start: sessionForm.start,
        end: sessionForm.end,
      });
      saveSessionAndRunOfShow(
        normalized,
        {
          notes: rosForm.notes,
          ownerName: rosForm.ownerName,
          ownerEmail: rosForm.ownerEmail,
          status: rosForm.status ?? "upcoming",
        },
        item?.id,
      );
      toast.success(item ? "Session & run-of-show updated" : "Session added to run of show");
    } else {
      if (!rosForm.title.trim()) return toast.error("Title is required");
      if (!rosForm.startTime.trim() || !rosForm.endTime.trim()) return toast.error("Start and end times are required");
      upsertRunOfShowItem({
        ...rosForm,
        id: item?.id ?? rosForm.id,
        day,
        type: kind,
        title: rosForm.title.trim(),
        sessionId: undefined,
      });
      toast.success(item ? "Activity updated" : "Activity added");
    }
    onSaved?.();
    onOpenChange(false);
  };

  const title =
    mode === "view" ? "View activity" : mode === "edit" ? "Edit run-of-show activity" : "Add run-of-show activity";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isView && previewSession ? (
          <div className="space-y-4">
            <SessionDetailPreview session={previewSession} productionNotes={item?.notes} />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/programme/${previewSession.id}`} target="_blank">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open public programme page
                </Link>
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : isView && item ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="font-serif font-bold text-lg">{item.title}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {item.startTime} – {item.endTime} · <span className="capitalize">{item.type}</span>
              </p>
              {item.notes && <p className="text-sm mt-3">{item.notes}</p>}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-5">
            {!item && (
              <div>
                <Label>Activity type *</Label>
                <Select
                  value={kind}
                  onValueChange={(v) => {
                    const k = v as ActivityKind;
                    setKind(k);
                    if (k !== "session") setRosForm((r) => ({ ...r, type: k }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">Programme session (full detail)</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="custom">Custom segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {kind === "session" ? (
              <>
                <SessionEditorFields form={sessionForm} onChange={setSessionForm} />
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Production & ownership
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Segment owner (optional)</Label>
                      <Select
                        value={rosForm.ownerName ? SPEAKERS.find((s) => s.name === rosForm.ownerName)?.id ?? "custom" : "none"}
                        onValueChange={(v) => {
                          if (v === "none") setRosForm({ ...rosForm, ownerName: "", ownerEmail: "" });
                          else if (v !== "custom") setOwner(v);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No owner</SelectItem>
                          {SPEAKERS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom…</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Owner email</Label>
                      <Input
                        type="email"
                        value={rosForm.ownerEmail ?? ""}
                        onChange={(e) => setRosForm({ ...rosForm, ownerEmail: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Production notes</Label>
                    <Textarea
                      rows={3}
                      value={rosForm.notes ?? ""}
                      onChange={(e) => setRosForm({ ...rosForm, notes: e.target.value })}
                      placeholder="Cue cards, AV handoff, transitions — not shown on public programme…"
                      className="mt-1"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Title *</Label>
                  <Input
                    required
                    value={rosForm.title}
                    onChange={(e) => setRosForm({ ...rosForm, title: e.target.value })}
                    className="mt-1"
                    placeholder={kind === "break" ? "e.g. Coffee break" : "e.g. House opens"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start *</Label>
                    <Input
                      required
                      type="time"
                      value={rosForm.startTime}
                      onChange={(e) => setRosForm({ ...rosForm, startTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>End *</Label>
                    <Input
                      required
                      type="time"
                      value={rosForm.endTime}
                      onChange={(e) => setRosForm({ ...rosForm, endTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    rows={3}
                    value={rosForm.notes ?? ""}
                    onChange={(e) => setRosForm({ ...rosForm, notes: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-blue text-accent-foreground">
                {item ? "Save changes" : "Add to run of show"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
