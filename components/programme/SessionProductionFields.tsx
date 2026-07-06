"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminSpeakers } from "@/hooks/api/useAdmin";
import type { RunOfShowItem } from "@/lib/store";

type Props = {
  value: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail">;
  onChange: (next: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail">) => void;
  notesPlaceholder?: string;
};

export function SessionProductionFields({ value, onChange, notesPlaceholder }: Props) {
  const { speakers, isLoading } = useAdminSpeakers({ limit: 100 });
  const [ownerQuery, setOwnerQuery] = useState("");

  const filteredOwners = useMemo(() => {
    const q = ownerQuery.trim().toLowerCase();
    if (!q) return speakers;
    return speakers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.organization ?? "").toLowerCase().includes(q) ||
        (s.title ?? "").toLowerCase().includes(q),
    );
  }, [speakers, ownerQuery]);

  const matchedOwnerId = speakers.find((s) => s.name === value.ownerName)?.id;
  const ownerSelectValue = !value.ownerName ? "none" : matchedOwnerId ?? "custom";

  const setOwnerFromSpeaker = (speakerId: string) => {
    const sp = speakers.find((s) => s.id === speakerId);
    if (!sp) return;
    onChange({
      ...value,
      ownerName: sp.name,
      ownerEmail: sp.userId ? undefined : value.ownerEmail,
    });
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Production & ownership
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Segment owner (optional)</Label>
          <div className="relative mt-1 mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search speakers for owner…"
              value={ownerQuery}
              onChange={(e) => setOwnerQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={ownerSelectValue}
            onValueChange={(v) => {
              if (v === "none") onChange({ ...value, ownerName: "", ownerEmail: "" });
              else if (v === "custom") onChange({ ...value, ownerName: value.ownerName ?? "" });
              else setOwnerFromSpeaker(v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading speakers…" : "Select owner"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No owner</SelectItem>
              {filteredOwners.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                  {s.organization ? ` · ${s.organization}` : ""}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom name…</SelectItem>
            </SelectContent>
          </Select>
          {ownerSelectValue === "custom" && (
            <Input
              value={value.ownerName ?? ""}
              onChange={(e) => onChange({ ...value, ownerName: e.target.value })}
              placeholder="Owner name"
              className="mt-2"
            />
          )}
        </div>
        <div>
          <Label>Owner email</Label>
          <Input
            type="email"
            value={value.ownerEmail ?? ""}
            onChange={(e) => onChange({ ...value, ownerEmail: e.target.value })}
            placeholder="contact@example.com"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label>Production notes</Label>
        <Textarea
          rows={3}
          value={value.notes ?? ""}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder={
            notesPlaceholder ??
            "Cue cards, AV handoff, transitions — not shown on public programme…"
          }
          className="mt-1"
        />
      </div>
    </div>
  );
}
