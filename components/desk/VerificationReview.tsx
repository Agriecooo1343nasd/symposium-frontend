import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  patchStore,
  appendAudit,
  type DocumentVerification,
} from "@/lib/store";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

export function VerificationReviewList({
  items,
  readOnly = false,
  highlightId,
}: {
  items: DocumentVerification[];
  readOnly?: boolean;
  highlightId?: string;
}) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const session = getSession();

  const approve = (item: DocumentVerification) => {
    patchStore((s) => ({
      ...s,
      documentVerifications: s.documentVerifications.map((d) =>
        d.id === item.id ? { ...d, status: "approved" as const } : d,
      ),
      registrations: s.registrations.map((r) =>
        r.id === item.registrationId
          ? { ...r, verificationStatus: "approved" as const }
          : r,
      ),
    }));
    appendAudit(
      session?.name ?? "Desk",
      "Approved verification",
      item.registrantEmail,
    );
    toast.success("Verification approved");
  };

  const reject = () => {
    if (!rejectId || !message.trim()) return;
    patchStore((s) => ({
      ...s,
      documentVerifications: s.documentVerifications.map((d) =>
        d.id === rejectId
          ? { ...d, status: "rejected" as const, reviewMessage: message }
          : d,
      ),
      registrations: s.registrations.map((r) => {
        const item = s.documentVerifications.find((d) => d.id === rejectId);
        return item && r.id === item.registrationId
          ? { ...r, verificationStatus: "rejected" as const }
          : r;
      }),
    }));
    appendAudit(session?.name ?? "Desk", "Rejected verification", rejectId);
    toast.info("Verification rejected");
    setRejectId(null);
    setMessage("");
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No verification requests.
        </p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          id={`verify-${item.id}`}
          className={`rounded-2xl bg-card border p-5 flex flex-wrap gap-4 ${
            highlightId === item.id
              ? "border-accent ring-2 ring-accent/30"
              : "border-border"
          }`}
        >
          {item.fileDataUrl && item.fileDataUrl.startsWith("data:image") && (
            <img
              src={item.fileDataUrl}
              alt=""
              className="h-24 w-32 object-cover rounded-lg border"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-serif font-bold">{item.registrantName}</div>
            <div className="text-sm text-muted-foreground">
              {item.registrantEmail} ·{" "}
              {item.type === "student" ? "Student ID" : "Organization letter"}
            </div>
            <div className="text-xs mt-1 font-mono">{item.fileName}</div>
            <span
              className={`inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                item.status === "approved"
                  ? "bg-green/15 text-green"
                  : item.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {item.status}
            </span>
            {item.reviewMessage && (
              <p className="text-xs mt-2 text-muted-foreground">
                {item.reviewMessage}
              </p>
            )}
          </div>
          {item.status === "pending" && !readOnly && (
            <div className="flex gap-2 items-start">
              <Button
                size="sm"
                className="gradient-blue text-accent-foreground"
                onClick={() => approve(item)}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectId(item.id)}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject verification</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Message *</Label>
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button onClick={reject} disabled={!message.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
