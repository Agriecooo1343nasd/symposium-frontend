import { useState } from "react";
import { User, Mail, Building2, MapPin, Phone, ShieldCheck, ShieldX, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ResolvedAttendee } from "@/lib/lead-capture";
import { captureLeadFromScan } from "@/lib/lead-capture";
import type { ExhibitorLead } from "@/lib/store";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendee: ResolvedAttendee | null;
  orgId: string;
  scannedBy?: string;
  onSaved: (lead: ExhibitorLead, updated: boolean) => void;
};

export function LeadCaptureDialog({ open, onOpenChange, attendee, orgId, scannedBy, onSaved }: Props) {
  const [boothNotes, setBoothNotes] = useState("");
  const [status, setStatus] = useState<ExhibitorLead["status"]>("None");

  const reset = () => {
    setBoothNotes("");
    setStatus("None");
  };

  const save = () => {
    if (!attendee) return;
    const res = captureLeadFromScan({
      orgId,
      attendee,
      boothNotes,
      status,
      scannedBy,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onSaved(res.lead, res.updated);
    reset();
    onOpenChange(false);
  };

  if (!attendee) return null;

  const reg = attendee.registration;
  const profile = attendee.profile;
  const interests = profile?.subThemeInterests ?? reg.details?.interests ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(o: boolean) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Capture lead from badge scan</DialogTitle>
          <DialogDescription>
            Attendee profile data is copied from their registration with consent. Add your booth notes before saving.
          </DialogDescription>
        </DialogHeader>

        {!attendee.allowExhibitorContact ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex gap-3">
            <ShieldX className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Contact sharing not allowed</p>
              <p className="mt-1 text-red-800">
                {reg.name} has opted out of exhibitor contact in their privacy settings. You cannot save this lead
                digitally — use a business card exchange instead.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center gap-3">
                {profile?.photo ? (
                  <img src={profile.photo} alt="" className="h-14 w-14 rounded-full object-cover border" />
                ) : (
                  <div className="h-14 w-14 rounded-full gradient-navy text-white flex items-center justify-center font-serif font-bold">
                    {reg.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}
                <div>
                  <div className="font-serif font-bold">{reg.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{attendee.ticketId}</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{profile?.org ?? reg.details?.org ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {reg.country}
                </div>
                <div className="flex items-center gap-2 min-w-0 sm:col-span-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{reg.email}</span>
                </div>
                {reg.details?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {reg.details.phone}
                  </div>
                )}
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {interests.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-card border">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-green flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Consent on file — exhibitor may contact
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Booth notes *
                </Label>
                <Textarea
                  className="mt-1 resize-none"
                  rows={4}
                  placeholder="What did they ask for? Demo interest, follow-up actions, products discussed…"
                  value={boothNotes}
                  onChange={(e) => setBoothNotes(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Visible only to your team — not shared with the attendee.</p>
              </div>
              <div>
                <Label>Follow-up status</Label>
                <Select value={status} onValueChange={(v: string) => setStatus(v as ExhibitorLead["status"])}>
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
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {attendee.allowExhibitorContact && (
            <Button
              className="gradient-blue text-accent-foreground"
              disabled={!boothNotes.trim()}
              onClick={save}
            >
              <User className="h-4 w-4 mr-1" /> Save lead
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
