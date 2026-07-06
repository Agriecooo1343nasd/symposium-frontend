"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  SessionEditorFields,
  normalizeSessionForm,
  validateSessionForm,
} from "@/components/programme/SessionEditorFields";
import { SessionProductionFields } from "@/components/programme/SessionProductionFields";
import { SessionDetailPreview } from "@/components/programme/SessionDetailPreview";
import { saveSessionAndRunOfShow, upsertRunOfShowItem } from "@/lib/programme-sync";
import { getSessionById } from "@/lib/sessions";
import { uid, type RunOfShowItem } from "@/lib/store";
import type { Session } from "@/lib/mock-data";
import { buildEmptySession } from "@/lib/session-form-defaults";
import {
  nextSortOrder,
  runOfShowItemToCreateDto,
  runOfShowItemToUpdateDto,
  sessionToRunOfShowDto,
} from "@/lib/run-of-show-mapping";
import {
  apiSessionToForm,
  persistSessionExtras,
  sessionFormToApiDto,
  sessionFormToUpdateDto,
} from "@/lib/session-admin-bridge";
import { useAdminSessions, useCreateSession, useUpdateSession } from "@/hooks/api/useAdmin";
import { useCreateRunOfShowItem, useRooms, useUpdateRunOfShowItem } from "@/hooks/api/useProgramme";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { toast } from "sonner";

export type RunOfShowDialogMode = "add" | "edit" | "view";
export type RunOfShowDataSource = "api" | "store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: RunOfShowDialogMode;
  day: 1 | 2;
  item?: RunOfShowItem | null;
  onSaved?: () => void;
  dataSource?: RunOfShowDataSource;
  allItems?: RunOfShowItem[];
};

type ActivityKind = "session" | "break" | "custom";

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

export function RunOfShowActivityDialog({
  open,
  onOpenChange,
  mode,
  day,
  item,
  onSaved,
  dataSource = "store",
  allItems = [],
}: Props) {
  const isApi = dataSource === "api";
  const symposiumId = useSymposiumId();
  const { rooms } = useRooms();
  const { sessions: apiSessions } = useAdminSessions({ limit: 200 });
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const createRos = useCreateRunOfShowItem();
  const updateRos = useUpdateRunOfShowItem();

  const isView = mode === "view";
  const [kind, setKind] = useState<ActivityKind>("session");
  const [sessionForm, setSessionForm] = useState<Session>(() => buildEmptySession(day, rooms));
  const [rosForm, setRosForm] = useState<RunOfShowItem>(() => emptyRos(day));
  const [saving, setSaving] = useState(false);

  const apiSessionMap = useMemo(() => {
    const map = new Map<string, Session>();
    apiSessions.forEach((dto) => map.set(dto.id, apiSessionToForm(dto)));
    return map;
  }, [apiSessions]);

  useEffect(() => {
    if (!open) return;
    if (!item) {
      setKind("session");
      setSessionForm(buildEmptySession(day, rooms));
      setRosForm(emptyRos(day));
      return;
    }
    setRosForm({ ...item });
    if (item.type === "session" && item.sessionId) {
      setKind("session");
      const linked = isApi
        ? apiSessionMap.get(item.sessionId)
        : getSessionById(item.sessionId);
      if (linked) {
        setSessionForm({ ...linked });
      } else {
        setSessionForm({ ...buildEmptySession(item.day, rooms), id: item.sessionId });
      }
    } else {
      setKind(item.type === "break" ? "break" : "custom");
    }
  }, [open, item, day, rooms, isApi, apiSessionMap]);

  const previewSession =
    isView && item?.sessionId
      ? isApi
        ? apiSessionMap.get(item.sessionId)
        : getSessionById(item.sessionId)
      : kind === "session"
        ? sessionForm
        : undefined;

  const productionValue: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail"> = {
    notes: rosForm.notes,
    ownerName: rosForm.ownerName,
    ownerEmail: rosForm.ownerEmail,
  };

  const setProduction = (next: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail">) => {
    setRosForm({ ...rosForm, ...next });
  };

  const saveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) {
      onOpenChange(false);
      return;
    }

    if (kind === "session") {
      const err = validateSessionForm(sessionForm);
      if (err) return toast.error(err);
      const normalized = normalizeSessionForm({ ...sessionForm, day });
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

  const saveApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) {
      onOpenChange(false);
      return;
    }
    if (!symposiumId) return toast.error("Symposium not loaded");

    setSaving(true);
    try {
      if (kind === "session") {
        const err = validateSessionForm(sessionForm);
        if (err) {
          toast.error(err);
          return;
        }
        const normalized = normalizeSessionForm({ ...sessionForm, day });
        const isEdit = Boolean(item?.sessionId && apiSessions.some((s) => s.id === normalized.id));

        const sessionDto = isEdit
          ? await updateSession.mutateAsync({
              id: normalized.id,
              dto: sessionFormToUpdateDto(normalized, symposiumId),
            })
          : await createSession.mutateAsync(sessionFormToApiDto(normalized, symposiumId));

        const withId = { ...normalized, id: sessionDto.id };
        persistSessionExtras(withId);

        const order = item?.order ?? nextSortOrder(allItems, day);
        const rosPayload: RunOfShowItem = {
          ...rosForm,
          id: item?.id ?? rosForm.id,
          day,
          order,
          type: "session",
          sessionId: withId.id,
          title: withId.title,
          startTime: withId.start,
          endTime: withId.end,
        };

        if (item?.id) {
          await updateRos.mutateAsync({ id: item.id, dto: runOfShowItemToUpdateDto(rosPayload) });
        } else {
          await createRos.mutateAsync(sessionToRunOfShowDto(withId, symposiumId, {
            notes: rosForm.notes,
            ownerName: rosForm.ownerName,
            ownerEmail: rosForm.ownerEmail,
            status: rosForm.status ?? "upcoming",
            order,
          }));
        }
        toast.success(item ? "Session & run-of-show updated" : "Session added to run of show");
      } else {
        if (!rosForm.title.trim()) {
          toast.error("Title is required");
          return;
        }
        if (!rosForm.startTime.trim() || !rosForm.endTime.trim()) {
          toast.error("Start and end times are required");
          return;
        }
        const payload: RunOfShowItem = {
          ...rosForm,
          id: item?.id ?? rosForm.id,
          day,
          type: kind,
          title: rosForm.title.trim(),
          sessionId: undefined,
          order: item?.order ?? nextSortOrder(allItems, day),
        };
        if (item?.id) {
          await updateRos.mutateAsync({ id: item.id, dto: runOfShowItemToUpdateDto(payload) });
        } else {
          await createRos.mutateAsync(runOfShowItemToCreateDto(payload, symposiumId));
        }
        toast.success(item ? "Activity updated" : "Activity added");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
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
              {item.ownerName && (
                <p className="text-sm mt-2">
                  Owner: <span className="font-medium">{item.ownerName}</span>
                </p>
              )}
              {item.notes && <p className="text-sm mt-3">{item.notes}</p>}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={isApi ? saveApi : saveStore} className="space-y-5">
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
                <SessionProductionFields value={productionValue} onChange={setProduction} />
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
                    <Label>Day *</Label>
                    <Select
                      value={String(rosForm.day)}
                      onValueChange={(v) => setRosForm({ ...rosForm, day: Number(v) as 1 | 2 })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Day 1 · 13 Aug</SelectItem>
                        <SelectItem value="2">Day 2 · 14 Aug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div />
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
                <SessionProductionFields
                  value={productionValue}
                  onChange={setProduction}
                  notesPlaceholder="Notes for breaks and transitions…"
                />
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-blue text-accent-foreground" disabled={saving}>
                {saving ? "Saving…" : item ? "Save changes" : "Add to run of show"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
