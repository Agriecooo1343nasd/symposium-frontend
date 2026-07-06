"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Session } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  sessions: Session[];
  value: string | null;
  onChange: (session: Session) => void;
  /** Session IDs already placed on the run of show (optional duplicate guard). */
  excludeSessionIds?: string[];
  isLoading?: boolean;
  /** When editing, allow the currently linked session even if excluded. */
  allowSessionId?: string | null;
};

export function RunOfShowSessionPicker({
  sessions,
  value,
  onChange,
  excludeSessionIds = [],
  isLoading = false,
  allowSessionId = null,
}: Props) {
  const [query, setQuery] = useState("");

  const excluded = useMemo(() => new Set(excludeSessionIds), [excludeSessionIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions
      .filter((s) => {
        if (!q) return true;
        return [s.title, s.room, s.type, s.description, `day ${s.day}`].some((v) =>
          String(v ?? "").toLowerCase().includes(q),
        );
      })
      .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
  }, [sessions, query]);

  const selected = sessions.find((s) => s.id === value);

  return (
    <div className="space-y-3">
      <div>
        <Label>Programme session *</Label>
        <p className="text-xs text-muted-foreground mt-1 mb-2">
          Pick a session from the catalogue. Content is edited on the{" "}
          <Link href="/admin/programme?tab=sessions" className="text-accent hover:underline">
            Sessions
          </Link>{" "}
          tab — here you only schedule it on the timeline.
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, room, format, day…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="max-h-52 overflow-y-auto rounded-md border border-border divide-y">
        {isLoading && <p className="text-xs text-muted-foreground p-3">Loading sessions…</p>}
        {!isLoading && sessions.length === 0 && (
          <p className="text-xs text-muted-foreground p-3">
            No sessions yet.{" "}
            <Link href="/admin/programme?tab=sessions" className="text-accent hover:underline">
              Create sessions first
            </Link>
            .
          </p>
        )}
        {!isLoading && sessions.length > 0 && filtered.length === 0 && (
          <p className="text-xs text-muted-foreground p-3">No sessions match your search.</p>
        )}
        {filtered.map((s) => {
          const isExcluded = excluded.has(s.id) && s.id !== allowSessionId;
          const isSelected = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={isExcluded}
              onClick={() => onChange(s)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-secondary/60",
                isSelected && "bg-accent/10 ring-1 ring-inset ring-accent/30",
                isExcluded && "opacity-50 cursor-not-allowed hover:bg-transparent",
              )}
            >
              <div className="font-medium line-clamp-1">{s.title}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Day {s.day}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {s.start}–{s.end}
                </span>
                {s.room && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.room}
                  </span>
                )}
                <span className="uppercase text-[10px] font-semibold tracking-wide">{s.type}</span>
              </div>
              {isExcluded && (
                <p className="text-[10px] text-amber-700 mt-1">Already on run of show</p>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-lg border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{selected.title}</span>
          {" · "}Day {selected.day}, {selected.start}–{selected.end}
          {selected.room ? ` · ${selected.room}` : ""}
        </div>
      )}
    </div>
  );
}
