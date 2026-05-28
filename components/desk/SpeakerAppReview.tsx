import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { patchStore, appendAudit, upgradeUserToSpeaker, type SpeakerApplication } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

export function SpeakerAppReviewList({ apps, readOnly = false }: { apps: SpeakerApplication[]; readOnly?: boolean }) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const session = getSession();

  const approve = (app: SpeakerApplication) => {
    patchStore((s) => ({
      ...s,
      speakerApplications: s.speakerApplications.map((a) =>
        a.id === app.id
          ? { ...a, status: "approved" as const, reviewedBy: session?.name, reviewedAt: new Date().toISOString() }
          : a,
      ),
    }));
    upgradeUserToSpeaker(app.email, app.name);
    appendAudit(session?.name ?? "Reviewer", "Approved speaker application", app.email);
    toast.success(`${app.name} is now a speaker`);
  };

  const reject = () => {
    if (!rejectId || !message.trim()) return;
    patchStore((s) => ({
      ...s,
      speakerApplications: s.speakerApplications.map((a) =>
        a.id === rejectId
          ? {
              ...a,
              status: "rejected" as const,
              reviewMessage: message,
              reviewedBy: session?.name,
              reviewedAt: new Date().toISOString(),
            }
          : a,
      ),
    }));
    appendAudit(session?.name ?? "Reviewer", "Rejected speaker application", rejectId);
    toast.info("Application rejected");
    setRejectId(null);
    setMessage("");
  };

  const pending = apps.filter((a) => a.status === "pending");

  return (
    <div className="space-y-4">
      {pending.length === 0 && apps.length > 0 && (
        <p className="text-sm text-muted-foreground">No pending applications.</p>
      )}
      {apps.map((app) => (
        <div key={app.id} className="rounded-2xl bg-card border border-border p-5">
          <div className="flex flex-wrap gap-4">
            {app.photoUrl && (
              <img src={app.photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-serif font-bold">{app.name}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    app.status === "approved"
                      ? "bg-green/15 text-green"
                      : app.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {app.status}
                </span>
                <span className="text-xs text-muted-foreground">{app.presentationType}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {app.email} · {app.phone} · {app.country}
              </div>
              <div className="font-medium mt-2">{app.title}</div>
              <p className="text-sm mt-1">{app.summary}</p>
              <p className="text-xs text-muted-foreground mt-2">{app.about}</p>
              {app.documentName && (
                <p className="text-xs mt-2">
                  Abstract: <span className="font-mono">{app.documentName}</span>
                </p>
              )}
              {app.reviewMessage && (
                <p className="text-xs mt-2 text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  {app.reviewMessage}
                </p>
              )}
            </div>
          </div>
          {app.status === "pending" && !readOnly && (
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => approve(app)}>
                <Check className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRejectId(app.id)}>
                <X className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Message to applicant *</Label>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" placeholder="Explain why…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button onClick={reject} disabled={!message.trim()}>
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
