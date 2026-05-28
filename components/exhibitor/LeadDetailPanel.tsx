import { Mail, Phone, History, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExhibitorLead } from "@/lib/store";
import { cn } from "@/lib/utils";

const statusColor = (s: string) =>
  s === "Converted"
    ? "bg-green/15 text-green"
    : s === "In Discussion"
      ? "bg-blue/15 text-blue"
      : s === "Contacted"
        ? "bg-amber-100 text-amber-800"
        : "bg-zinc-100 text-zinc-700";

type Props = {
  lead: ExhibitorLead;
  onChange: (lead: ExhibitorLead) => void;
  onClose: () => void;
};

export function LeadDetailPanel({ lead, onChange, onClose }: Props) {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-5 sticky top-20">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h2 className="font-serif font-bold text-xl">{lead.name}</h2>
          <p className="text-sm text-muted-foreground">{lead.title} · {lead.org}</p>
        </div>
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0", statusColor(lead.status))}>
          {lead.status}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd className="font-medium break-all flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" /> {lead.email}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Country</dt>
          <dd className="font-medium mt-0.5">{lead.country}</dd>
        </div>
        {lead.phone && (
          <div>
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd className="font-medium mt-0.5 flex items-center gap-1">
              <Phone className="h-3 w-3" /> {lead.phone}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-muted-foreground">Captured</dt>
          <dd className="font-medium mt-0.5">{lead.capturedAt}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Interests</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {(lead.interests?.length ? lead.interests : [lead.interest]).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">
                {t}
              </span>
            ))}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Method</dt>
          <dd className="font-medium mt-0.5 capitalize">
            {lead.captureMethod === "qr_scan" ? "QR badge scan" : "Manual"}
            {lead.scannedBy ? ` · ${lead.scannedBy}` : ""}
          </dd>
        </div>
      </dl>

      <div>
        <Label>Booth notes</Label>
        <Textarea
          className="mt-1"
          rows={3}
          value={lead.boothNotes ?? ""}
          onChange={(e) => onChange({ ...lead, boothNotes: e.target.value })}
        />
      </div>

      <div>
        <Label>CRM status</Label>
        <Select value={lead.status} onValueChange={(v: string) => onChange({ ...lead, status: v as ExhibitorLead["status"] })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["None", "Contacted", "In Discussion", "Converted"] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {lead.history?.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-2">
            <History className="h-3.5 w-3.5" /> Contact history
          </h3>
          <ol className="space-y-2 max-h-40 overflow-y-auto">
            {[...lead.history].reverse().map((h, i) => (
              <li key={i} className="text-xs border-l-2 border-accent pl-3 py-1">
                <div className="text-muted-foreground">
                  {new Date(h.at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                  {h.by ? ` · ${h.by}` : ""}
                </div>
                <div className="mt-0.5 flex gap-1">
                  <MessageSquare className="h-3 w-3 shrink-0 opacity-50" />
                  {h.note}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
