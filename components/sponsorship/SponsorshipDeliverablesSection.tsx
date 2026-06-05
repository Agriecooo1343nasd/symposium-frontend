"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardList, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  addDeliverable,
  removeDeliverable,
  updateDeliverable,
} from "@/lib/sponsorship-deliverables";
import {
  DELIVERABLE_CHANNEL_LABELS,
  DELIVERABLE_STATUS_LABELS,
} from "@/lib/sponsorship-records";
import type { SponsorshipDeliverable, SponsorshipDeliverableStatus } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  orgId: string;
  deliverables: SponsorshipDeliverable[];
  mode: "exhibitor" | "admin";
  actorName?: string;
  onChanged?: () => void;
};

const CHANNELS = Object.keys(DELIVERABLE_CHANNEL_LABELS) as SponsorshipDeliverable["channel"][];
const STATUSES = Object.keys(DELIVERABLE_STATUS_LABELS) as SponsorshipDeliverableStatus[];

export function SponsorshipDeliverablesSection({ orgId, deliverables, mode, actorName = "Admin", onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState<SponsorshipDeliverable["channel"]>("homepage");
  const [dueDate, setDueDate] = useState("");

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    addDeliverable({ orgId, title, description, channel, dueDate }, actorName);
    setTitle("");
    setDescription("");
    setDueDate("");
    setAdding(false);
    toast.success("Deliverable added");
    onChanged?.();
  };

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif font-bold text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-accent" />
          Sponsorship deliverables
        </h2>
        {mode === "admin" && (
          <Button type="button" size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add deliverable
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {mode === "admin"
          ? "Track homepage, newsletter, programme, signage, and other sponsor commitments (FR-5.1 / FR-5.2)."
          : "Commitments from the secretariat for your sponsorship package — status updates appear here."}
      </p>

      {adding && mode === "admin" && (
        <form onSubmit={submitAdd} className="rounded-xl border bg-secondary/20 p-4 space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as SponsorshipDeliverable["channel"])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>{DELIVERABLE_CHANNEL_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" required />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="gradient-blue text-accent-foreground">Save</Button>
          </div>
        </form>
      )}

      {deliverables.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-4">No deliverables on file yet.</p>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => {
            const st = DELIVERABLE_STATUS_LABELS[d.status] ?? DELIVERABLE_STATUS_LABELS.pending;
            return (
              <div key={d.id} className="rounded-xl border p-4 sm:p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {DELIVERABLE_CHANNEL_LABELS[d.channel]} · due {d.dueDate}
                    </div>
                  </div>
                  {mode === "admin" ? (
                    <Select
                      value={d.status}
                      onValueChange={(v) => {
                        updateDeliverable(d.id, { status: v as SponsorshipDeliverableStatus }, actorName);
                        toast.success("Status updated");
                        onChanged?.();
                      }}
                    >
                      <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{DELIVERABLE_STATUS_LABELS[s].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full h-fit", st.className)}>
                      {st.label}
                    </span>
                  )}
                </div>
                {d.description && <p className="text-sm text-muted-foreground mt-2">{d.description}</p>}
                {d.secretariatNote && (
                  <p className="text-xs mt-2 bg-secondary/50 rounded-lg px-3 py-2">{d.secretariatNote}</p>
                )}
                {d.liveAt && (
                  <p className="text-xs text-green mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Live since {d.liveAt}
                  </p>
                )}
                {mode === "admin" && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive h-7"
                      onClick={() => {
                        removeDeliverable(d.id, actorName);
                        toast.info("Deliverable removed");
                        onChanged?.();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
