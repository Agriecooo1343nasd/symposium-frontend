"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubThemeBadge } from "@/components/SubThemeBadge";
import {
  RunOfShowActivityDialog,
  type RunOfShowDialogMode,
} from "@/components/moderator/RunOfShowActivityDialog";
import { useStore } from "@/hooks/use-store";
import { patchStore, type RunOfShowItem } from "@/lib/store";
import { getSessionById } from "@/lib/sessions";
import { sessionVisibility } from "@/lib/access";
import { deleteRunOfShowItem } from "@/lib/programme-sync";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type RunOfShowDayFilter = "all" | 1 | 2;

type Props = {
  dayFilter: RunOfShowDayFilter;
  onDayFilterChange?: (day: RunOfShowDayFilter) => void;
  showDayFilter?: boolean;
  showGoLive?: boolean;
};

export function RunOfShowPanel({ dayFilter, onDayFilterChange, showDayFilter = true, showGoLive = false }: Props) {
  const store = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<RunOfShowDialogMode>("add");
  const [activeItem, setActiveItem] = useState<RunOfShowItem | null>(null);
  const [dialogDay, setDialogDay] = useState<1 | 2>(1);

  const filtered =
    dayFilter === "all"
      ? store.runOfShow
      : store.runOfShow.filter((r) => r.day === dayFilter);

  const grouped = ([1, 2] as const)
    .map((day) => ({
      day,
      items: filtered.filter((r) => r.day === day).sort((a, b) => a.order - b.order),
    }))
    .filter((g) => dayFilter === "all" || g.day === dayFilter);

  const saveItems = (day: 1 | 2, next: RunOfShowItem[]) => {
    patchStore((s) => ({
      ...s,
      runOfShow: [...s.runOfShow.filter((r) => r.day !== day), ...next.map((item, i) => ({ ...item, order: i + 1 }))],
    }));
  };

  const openDialog = (mode: RunOfShowDialogMode, day: 1 | 2, item?: RunOfShowItem) => {
    setDialogMode(mode);
    setDialogDay(day);
    setActiveItem(item ?? null);
    setDialogOpen(true);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this activity? Linked programme session data is kept unless you delete it separately."))
      return;
    deleteRunOfShowItem(id);
    toast.success("Removed from run of show");
  };

  const move = (day: 1 | 2, items: RunOfShowItem[], id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const copy = [...items];
    [copy[idx], copy[swap]] = [copy[swap], copy[idx]];
    saveItems(day, copy);
  };

  const defaultAddDay = dayFilter === 2 ? 2 : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showDayFilter && onDayFilterChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Day</span>
            <Select value={String(dayFilter)} onValueChange={(v) => onDayFilterChange(v === "all" ? "all" : (Number(v) as 1 | 2))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                <SelectItem value="1">Day 1 · 13 Aug</SelectItem>
                <SelectItem value="2">Day 2 · 14 Aug</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button className="gradient-blue text-accent-foreground ml-auto" onClick={() => openDialog("add", defaultAddDay)}>
          <Plus className="h-4 w-4 mr-1" /> Add activity
        </Button>
      </div>

      {grouped.every((g) => g.items.length === 0) && (
        <p className="text-sm text-muted-foreground rounded-md border border-dashed p-8 text-center">
          No activities yet. Add a programme session or a break.
        </p>
      )}

      {grouped.map(({ day, items }) =>
        items.length === 0 ? null : (
          <div key={day} className="space-y-3">
            {dayFilter === "all" && (
              <h3 className="font-serif font-bold text-lg">Day {day}</h3>
            )}
            {items.map((item, i) => {
              const session = item.sessionId ? getSessionById(item.sessionId) : undefined;
              const vis = session ? sessionVisibility(session) : null;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-md bg-card border border-border p-4 flex flex-wrap gap-4 justify-between",
                    showGoLive && item.status === "live" && "border-red-400 bg-red-50/50",
                    showGoLive && item.status === "done" && "opacity-60",
                  )}
                >
                  <div className="flex gap-3 min-w-0 flex-1">
                    <div className="font-mono text-lg font-bold text-muted-foreground w-7 shrink-0">{i + 1}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-serif font-bold">{item.title}</span>
                        {session && (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-secondary">
                            {session.type}
                          </span>
                        )}
                        {vis && (
                          <span
                            className={cn(
                              "text-[10px] uppercase font-semibold px-2 py-0.5 rounded inline-flex items-center gap-0.5",
                              vis === "public" ? "bg-green/15 text-green" : "bg-amber-100 text-amber-900",
                            )}
                          >
                            {vis === "public" ? (
                              <>
                                <Globe className="h-3 w-3" /> Public
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" /> Subscribers
                              </>
                            )}
                          </span>
                        )}
                        {showGoLive && item.status === "live" && (
                          <span className="text-[10px] uppercase font-bold text-red-600 animate-pulse">Live</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.startTime} – {item.endTime} · <span className="capitalize">{item.type}</span>
                        {session?.room && <> · {session.room}</>}
                        {session?.capacity != null && <> · cap. {session.capacity}</>}
                      </div>
                      {session && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <SubThemeBadge theme={session.subTheme} />
                          {session.speakers.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {session.speakers.length} speaker{session.speakers.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                      {item.ownerName && (
                        <div className="text-xs mt-1 text-foreground">
                          Owner: <span className="font-medium">{item.ownerName}</span>
                        </div>
                      )}
                      {item.notes && <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{item.notes}</p>}
                      {session && (
                        <Link
                          href={`/programme/${session.id}`}
                          target="_blank"
                          className="text-xs text-accent font-medium mt-2 inline-block hover:underline"
                        >
                          Preview on programme →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => move(day, items, item.id, -1)} disabled={i === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => move(day, items, item.id, 1)} disabled={i === items.length - 1}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openDialog("view", day, item)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openDialog("edit", day, item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ),
      )}

      <RunOfShowActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        day={dialogDay}
        item={activeItem}
        onSaved={() => setActiveItem(null)}
      />
    </div>
  );
}
