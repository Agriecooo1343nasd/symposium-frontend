"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessionProductionFields } from "@/components/programme/SessionProductionFields";
import { SessionDetailPreview } from "@/components/programme/SessionDetailPreview";
import { RunOfShowSessionPicker } from "@/components/programme/RunOfShowSessionPicker";
import { upsertRunOfShowItem } from "@/lib/programme-sync";
import { getSessionById, getSessions } from "@/lib/sessions";
import { uid, type RunOfShowItem } from "@/lib/store";
import type { Session } from "@/lib/mock-data";
import {
  linkSessionToRunOfShowItem,
  nextSortOrder,
  runOfShowItemToCreateDto,
  runOfShowItemToUpdateDto,
} from "@/lib/run-of-show-mapping";
import { apiSessionToForm } from "@/lib/session-admin-bridge";
import { useAdminSessions } from "@/hooks/api/useAdmin";
import { useCreateRunOfShowItem, useUpdateRunOfShowItem } from "@/hooks/api/useProgramme";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { releaseStuckRadixLayerLocks } from "@/lib/radix-layer-fix";
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
  const { sessions: apiSessions, isLoading: sessionsLoading } = useAdminSessions({ limit: 200 });
  const createRos = useCreateRunOfShowItem();
  const updateRos = useUpdateRunOfShowItem();

  const isView = mode === "view";
  const [kind, setKind] = useState<ActivityKind>("session");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [rosForm, setRosForm] = useState<RunOfShowItem>(() => emptyRos(day));
  const [saving, setSaving] = useState(false);

  const catalogueSessions = useMemo(() => {
    if (isApi) return apiSessions.map(apiSessionToForm);
    return getSessions();
  }, [isApi, apiSessions]);

  const sessionById = useMemo(() => {
    const map = new Map<string, Session>();
    catalogueSessions.forEach((s) => map.set(s.id, s));
    return map;
  }, [catalogueSessions]);

  const scheduledSessionIds = useMemo(
    () =>
      allItems
        .filter((i) => i.type === "session" && i.sessionId)
        .map((i) => i.sessionId as string),
    [allItems],
  );

  useEffect(() => {
    if (!open) return;
    if (!item) {
      setKind("session");
      setSelectedSessionId(null);
      setRosForm(emptyRos(day));
      return;
    }
    setRosForm({ ...item });
    if (item.type === "session" && item.sessionId) {
      setKind("session");
      setSelectedSessionId(item.sessionId);
    } else {
      setKind(item.type === "break" ? "break" : "custom");
      setSelectedSessionId(null);
    }
  }, [open, item, day]);

  const selectedSession = selectedSessionId ? sessionById.get(selectedSessionId) : undefined;

  const previewSession =
    isView && item?.sessionId
      ? sessionById.get(item.sessionId) ?? (isApi ? undefined : getSessionById(item.sessionId))
      : kind === "session"
        ? selectedSession
        : undefined;

  const productionValue: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail"> = {
    notes: rosForm.notes,
    ownerName: rosForm.ownerName,
    ownerEmail: rosForm.ownerEmail,
  };

  const setProduction = (next: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail">) => {
    setRosForm({ ...rosForm, ...next });
  };

  const pickSession = (session: Session) => {
    setSelectedSessionId(session.id);
    setRosForm((prev) => ({
      ...prev,
      type: "session",
      sessionId: session.id,
      title: session.title,
      startTime: session.start,
      endTime: session.end,
      day: session.day,
    }));
  };

  const saveSessionLink = async () => {
    if (!selectedSession) {
      toast.error("Select a programme session");
      return;
    }

    const order = item?.order ?? nextSortOrder(allItems, selectedSession.day);
    const payload = linkSessionToRunOfShowItem(selectedSession, {
      id: item?.id ?? rosForm.id,
      order,
      notes: rosForm.notes,
      ownerName: rosForm.ownerName,
      ownerEmail: rosForm.ownerEmail,
      status: rosForm.status ?? item?.status ?? "upcoming",
    });

    if (isApi) {
      if (!symposiumId) {
        toast.error("Symposium not loaded");
        return;
      }
      if (item?.id) {
        await updateRos.mutateAsync({ id: item.id, dto: runOfShowItemToUpdateDto(payload) });
      } else {
        await createRos.mutateAsync(runOfShowItemToCreateDto(payload, symposiumId));
      }
    } else {
      upsertRunOfShowItem({
        ...payload,
        id: item?.id ?? rosForm.id ?? uid("ros"),
      });
    }

    toast.success(item ? "Run-of-show updated" : "Session added to run of show");
    onSaved?.();
    onOpenChange(false);
  };

  const saveBreakOrCustom = async () => {
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
      day: rosForm.day,
      type: kind,
      title: rosForm.title.trim(),
      sessionId: undefined,
      order: item?.order ?? nextSortOrder(allItems, rosForm.day),
    };

    if (isApi) {
      if (!symposiumId) {
        toast.error("Symposium not loaded");
        return;
      }
      if (item?.id) {
        await updateRos.mutateAsync({ id: item.id, dto: runOfShowItemToUpdateDto(payload) });
      } else {
        await createRos.mutateAsync(runOfShowItemToCreateDto(payload, symposiumId));
      }
    } else {
      upsertRunOfShowItem(payload);
    }

    toast.success(item ? "Activity updated" : "Activity added");
    onSaved?.();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      if (kind === "session") {
        await saveSessionLink();
      } else {
        await saveBreakOrCustom();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const dialogTitle =
    mode === "view" ? "View activity" : mode === "edit" ? "Edit run-of-show activity" : "Add run-of-show activity";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) releaseStuckRadixLayerLocks();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
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
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/programme?tab=sessions">Edit session content</Link>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {!item && (
              <div>
                <Label>Activity type *</Label>
                <Select
                  value={kind}
                  onValueChange={(v) => {
                    const k = v as ActivityKind;
                    setKind(k);
                    if (k !== "session") {
                      setSelectedSessionId(null);
                      setRosForm((r) => ({ ...r, type: k, sessionId: undefined }));
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">Programme session</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="custom">Custom segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {kind === "session" ? (
              <>
                <RunOfShowSessionPicker
                  sessions={catalogueSessions}
                  value={selectedSessionId}
                  onChange={pickSession}
                  excludeSessionIds={scheduledSessionIds}
                  allowSessionId={item?.sessionId}
                  isLoading={isApi && sessionsLoading}
                />
                {selectedSession && item && (
                  <p className="text-xs text-muted-foreground">
                    Session content is managed on the{" "}
                    <Link href="/admin/programme?tab=sessions" className="text-accent hover:underline">
                      Sessions
                    </Link>{" "}
                    tab. Here you can change which session is scheduled or update production notes.
                  </p>
                )}
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
