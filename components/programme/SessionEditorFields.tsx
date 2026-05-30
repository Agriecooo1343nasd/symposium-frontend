"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SUB_THEMES, type Session, type SubTheme } from "@/lib/mock-data";
import { getRooms } from "@/lib/platform-settings";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

const SESSION_TYPES: Session["type"][] = ["Keynote", "Plenary", "Panel", "Workshop", "Field Visit"];

type Props = {
  form: Session;
  onChange: (session: Session) => void;
  showVisibility?: boolean;
};

export function SessionEditorFields({ form, onChange, showVisibility = true }: Props) {
  const store = useStore();
  const rooms = getRooms();
  const [speakerQuery, setSpeakerQuery] = useState("");

  const speakers = store.speakerProfiles;
  const filteredSpeakers = useMemo(() => {
    const q = speakerQuery.trim().toLowerCase();
    if (!q) return speakers;
    return speakers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.org.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q),
    );
  }, [speakers, speakerQuery]);

  const toggleSpeaker = (id: string) => {
    onChange({
      ...form,
      speakers: form.speakers.includes(id) ? form.speakers.filter((s) => s !== id) : [...form.speakers, id],
    });
  };

  const objectives = form.learningObjectives ?? [];

  const setObjectives = (next: string[]) => onChange({ ...form, learningObjectives: next });

  const isPublic = (form.visibility ?? "public") === "public";

  return (
    <div className="space-y-5">
      <div>
        <Label>Session title *</Label>
        <Input
          required
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="e.g. Scaling Agroecological Practices…"
          className="mt-1"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Day *</Label>
          <Select value={String(form.day)} onValueChange={(v) => onChange({ ...form, day: Number(v) as 1 | 2 })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Day 1 · 13 Aug</SelectItem>
              <SelectItem value="2">Day 2 · 14 Aug</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Start *</Label>
          <Input
            required
            type="time"
            value={form.start}
            onChange={(e) => onChange({ ...form, start: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>End *</Label>
          <Input
            required
            type="time"
            value={form.end}
            onChange={(e) => onChange({ ...form, end: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Format *</Label>
          <Select value={form.type} onValueChange={(v) => onChange({ ...form, type: v as Session["type"] })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Keynote, Plenary…" />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Room / location *</Label>
          <Select value={form.room} onValueChange={(v) => onChange({ ...form, room: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.name}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Sub-theme *</Label>
        <Select value={form.subTheme} onValueChange={(v) => onChange({ ...form, subTheme: v as SubTheme })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Policy & Governance, Soil Health…" />
          </SelectTrigger>
          <SelectContent>
            {SUB_THEMES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Shown on programme cards and detail (e.g. Policy & Governance).</p>
      </div>

      <div>
        <Label>Capacity *</Label>
        <Input
          required
          type="number"
          min={1}
          value={form.capacity ?? ""}
          onChange={(e) => onChange({ ...form, capacity: e.target.value ? Number(e.target.value) : undefined })}
          className="mt-1"
          placeholder="e.g. 250"
        />
      </div>

      {showVisibility && (
        <div className="rounded-lg border border-border p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Label className="text-base">Programme visibility</Label>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              {isPublic
                ? "Public — listed on /programme for all visitors."
                : "Subscribers only — hidden from public listings; visible to paid delegates and portal staff."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium", isPublic ? "text-muted-foreground" : "text-foreground")}>
              Subscribers
            </span>
            <Switch
              checked={isPublic}
              onCheckedChange={(checked) => onChange({ ...form, visibility: checked ? "public" : "subscribers" })}
            />
            <span className={cn("text-xs font-medium", isPublic ? "text-foreground" : "text-muted-foreground")}>
              Public
            </span>
          </div>
        </div>
      )}

      <div>
        <Label>Speakers *</Label>
        <p className="text-xs text-muted-foreground mb-2">Select from saved speaker profiles.</p>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, org, title…"
            value={speakerQuery}
            onChange={(e) => setSpeakerQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2 space-y-1">
          {filteredSpeakers.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No speakers match your search.</p>
          )}
          {filteredSpeakers.map((s) => (
            <label
              key={s.id}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm hover:bg-secondary/60",
                form.speakers.includes(s.id) && "bg-secondary/80",
              )}
            >
              <input type="checkbox" checked={form.speakers.includes(s.id)} onChange={() => toggleSpeaker(s.id)} />
              <img src={s.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
              <span className="min-w-0 flex-1">
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground block truncate">
                  {s.title} · {s.org}
                </span>
              </span>
            </label>
          ))}
        </div>
        {form.speakers.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{form.speakers.length} speaker(s) selected</p>
        )}
      </div>

      <div>
        <Label>Summary (programme card) *</Label>
        <Textarea
          required
          rows={2}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className="mt-1"
          placeholder="One paragraph for listings and quick view…"
        />
      </div>

      <div>
        <Label>Full description (detail page) *</Label>
        <Textarea
          required
          rows={4}
          value={form.longDescription ?? ""}
          onChange={(e) => onChange({ ...form, longDescription: e.target.value })}
          className="mt-1"
          placeholder="What delegates will experience in this session…"
        />
      </div>

      <div>
        <Label>What you&apos;ll take away *</Label>
        <p className="text-xs text-muted-foreground mb-2">Learning objectives shown on the session detail page.</p>
        <ul className="space-y-2">
          {objectives.map((obj, i) => (
            <li key={i} className="flex gap-2">
              <Input
                required
                value={obj}
                onChange={(e) => {
                  const next = [...objectives];
                  next[i] = e.target.value;
                  setObjectives(next);
                }}
                placeholder={`Objective ${i + 1}`}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setObjectives(objectives.filter((_, j) => j !== i))}
                aria-label="Remove objective"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setObjectives([...objectives, ""])}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add objective
        </Button>
      </div>

      <div>
        <Label>Good to know (optional)</Label>
        <Textarea
          rows={2}
          value={form.prerequisites ?? ""}
          onChange={(e) => onChange({ ...form, prerequisites: e.target.value || undefined })}
          className="mt-1"
          placeholder="Prerequisites, what to bring, dress code…"
        />
      </div>
    </div>
  );
}

export function validateSessionForm(form: Session): string | null {
  if (!form.title.trim()) return "Session title is required";
  if (!form.description.trim()) return "Summary is required";
  if (!form.longDescription?.trim()) return "Full description is required";
  if (!form.room.trim()) return "Room is required";
  if (!form.capacity || form.capacity < 1) return "Capacity must be at least 1";
  if (form.speakers.length === 0) return "Select at least one speaker";
  const objectives = (form.learningObjectives ?? []).map((o) => o.trim()).filter(Boolean);
  if (objectives.length === 0) return "Add at least one learning objective";
  return null;
}

export function normalizeSessionForm(form: Session): Session {
  return {
    ...form,
    learningObjectives: (form.learningObjectives ?? []).map((o) => o.trim()).filter(Boolean),
    visibility: form.visibility ?? "public",
  };
}
