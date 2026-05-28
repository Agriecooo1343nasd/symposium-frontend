import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock, FileText, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { getCancellationPolicy, submitCancellationRequest } from "@/lib/registration-ops";
import { getPlatformSettings } from "@/lib/platform-settings";
import { cn } from "@/lib/utils";
import type { CancellationRequest } from "@/lib/store";
import { toast } from "sonner";

type Props = {
  email: string;
  name: string;
};

const STEPS = [
  { key: "submit", label: "Submit request" },
  { key: "review", label: "Secretariat review" },
  { key: "decision", label: "Approved or declined" },
  { key: "payout", label: "Refund / transfer completed" },
] as const;

type StepState = "done" | "active" | "upcoming" | "failed";

function getStepState(index: number, req: CancellationRequest): StepState {
  if (req.status === "pending") {
    if (index === 0) return "done";
    if (index === 1) return "active";
    return "upcoming";
  }
  if (req.status === "rejected") {
    if (index <= 1) return "done";
    if (index === 2) return "failed";
    return "upcoming";
  }
  return "done";
}

function StatusBadge({ status }: { status: CancellationRequest["status"] }) {
  return (
    <span
      className={cn(
        "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0",
        status === "approved" && "bg-green/15 text-green",
        status === "rejected" && "bg-red-100 text-red-700",
        status === "pending" && "bg-amber-100 text-amber-800",
      )}
    >
      {status}
    </span>
  );
}

function RequestTimeline({ req }: { req: CancellationRequest }) {
  const settings = getPlatformSettings();

  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Tracking</p>
      <ol className="space-y-0">
        {STEPS.map((step, i) => {
          const state = getStepState(i, req);
          const done = state === "done";
          const active = state === "active";
          const failed = state === "failed";
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center border-2 shrink-0",
                    failed && "border-red-300 bg-red-50 text-red-600",
                    done && "border-green bg-green/10 text-green",
                    active && "border-accent bg-accent/10 text-accent",
                    state === "upcoming" && "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {failed ? (
                    <XCircle className="h-3.5 w-3.5" />
                  ) : done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : active ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[20px] my-0.5",
                      done ? "bg-green/40" : failed && i === 1 ? "bg-red-200" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className={cn("pb-4 min-w-0", i === STEPS.length - 1 && "pb-0")}>
                <div
                  className={cn(
                    "text-sm font-medium",
                    (active || done) && "text-foreground",
                    state === "upcoming" && "text-muted-foreground",
                    failed && "text-red-700",
                  )}
                >
                  {step.label}
                </div>
                {i === 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submitted {new Date(req.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                )}
                {i === 1 && req.status === "pending" && (
                  <p className="text-xs text-amber-800 mt-0.5">Usually reviewed within 3–5 business days</p>
                )}
                {i === 2 && req.status === "rejected" && req.processedAt && (
                  <p className="text-xs text-red-700 mt-0.5">
                    Declined {new Date(req.processedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  </p>
                )}
                {i === 2 && req.status === "approved" && req.processedAt && (
                  <p className="text-xs text-green mt-0.5">
                    Approved {new Date(req.processedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    {req.processedBy ? ` · ${req.processedBy}` : ""}
                  </p>
                )}
                {i === 3 && req.status === "approved" && req.type === "refund" && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Refund of ${req.refundAmountUsd?.toFixed(2) ?? "—"} to original payment method within{" "}
                    {settings.refundProcessingDays} business days
                  </p>
                )}
                {i === 3 && req.status === "approved" && req.type === "transfer" && req.transferToName && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pass transferred to {req.transferToName} ({req.transferToEmail})
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function RefundCancellationPanel({ email, name }: Props) {
  const store = useStore();
  const reg = store.registrations.find((r) => r.email === email);
  const policy = getCancellationPolicy();
  const settings = getPlatformSettings();
  const myRequests = store.cancellationRequests
    .filter((c) => c.requesterEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hasPending = myRequests.some((c) => c.status === "pending");
  const [type, setType] = useState<"refund" | "transfer">("refund");
  const [reason, setReason] = useState("");
  const [transferName, setTransferName] = useState("");
  const [transferEmail, setTransferEmail] = useState("");

  if (!reg) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        No paid registration found for this account. Register first to manage cancellations.
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Please provide a reason");
    if (type === "transfer" && (!transferName.trim() || !transferEmail.trim())) {
      return toast.error("Transfer requires new attendee name and email");
    }
    const res = submitCancellationRequest({
      registrationId: reg.id,
      requesterEmail: email,
      requesterName: name,
      type,
      reason: reason.trim(),
      transferToName: type === "transfer" ? transferName.trim() : undefined,
      transferToEmail: type === "transfer" ? transferEmail.trim() : undefined,
    });
    if (!res.ok) return toast.error(res.error);
    toast.success("Request submitted — the secretariat will review manually");
    setReason("");
    setTransferName("");
    setTransferEmail("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <FileText className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif font-bold">Your registration</div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {reg.details?.ticketId} · {reg.category} · {reg.country}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-lg font-bold">${reg.amountUsd}</div>
          <span
            className={cn(
              "text-[10px] uppercase font-bold",
              reg.status === "paid" ? "text-green" : "text-amber-700",
            )}
          >
            {reg.status}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="rounded-xl border bg-secondary/30 px-3 py-2 text-center">
            <div className="text-[10px] text-muted-foreground font-bold">{i + 1}</div>
            <div className="text-xs font-medium mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 text-sm text-amber-950 leading-relaxed">
        <div className="font-semibold text-xs uppercase tracking-wider mb-2">Cancellation & refund policy</div>
        {policy}
      </div>

      <Tabs defaultValue={hasPending ? "history" : "request"}>
        <TabsList>
          <TabsTrigger value="request">New request</TabsTrigger>
          <TabsTrigger value="history">
            Track requests ({myRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-4">
          {hasPending ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-950 mb-4">
              You already have a request under review. The secretariat will email you when it is processed. You can
              follow progress in <strong>Track requests</strong>.
            </div>
          ) : null}
          <form
            onSubmit={submit}
            className={cn(
              "rounded-2xl border bg-card p-4 sm:p-6 space-y-4 max-w-xl",
              hasPending && "opacity-60 pointer-events-none",
            )}
          >
            <div>
              <Label>Request type</Label>
              <Select value={type} onValueChange={(v: string) => setType(v as "refund" | "transfer")} disabled={hasPending}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">Cancel & refund</SelectItem>
                  <SelectItem value="transfer">Transfer registration to someone else</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                {type === "refund"
                  ? `Eligible refund amount is calculated per policy (your pass: $${reg.amountUsd}). Processing takes up to ${settings.refundProcessingDays} business days after approval.`
                  : "Free of charge once approved. The new attendee receives their own confirmation and QR pass."}
              </p>
            </div>
            <div>
              <Label>Reason *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-1"
                required
                placeholder="Explain your situation (visa issues, medical, schedule conflict, transfer to colleague…)"
                disabled={hasPending}
              />
            </div>
            {type === "transfer" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>New attendee name *</Label>
                  <Input
                    value={transferName}
                    onChange={(e) => setTransferName(e.target.value)}
                    className="mt-1"
                    placeholder="Full name"
                    disabled={hasPending}
                  />
                </div>
                <div>
                  <Label>New attendee email *</Label>
                  <Input
                    type="email"
                    value={transferEmail}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    className="mt-1"
                    placeholder="email@organisation.org"
                    disabled={hasPending}
                  />
                </div>
              </div>
            )}
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={hasPending}>
              <Send className="h-4 w-4 mr-1" /> Submit for review
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          {myRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-xl border p-6 text-center">
              No requests yet. Use <strong>New request</strong> to cancel, refund, or transfer your pass.
            </p>
          ) : (
            myRequests.map((c) => (
              <div key={c.id} className="rounded-2xl border bg-card p-4 sm:p-5 text-sm shadow-sm">
                <div className="flex flex-wrap justify-between gap-2 items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold capitalize">
                        {c.type === "refund" ? "Refund" : "Transfer"}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">Ref {c.id}</p>
                  </div>
                  {c.refundAmountUsd != null && c.type === "refund" && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Requested amount</div>
                      <div className="font-mono font-bold">${c.refundAmountUsd.toFixed(2)}</div>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground mt-3 leading-relaxed">{c.reason}</p>
                {c.type === "transfer" && (c.transferToName || c.transferToEmail) && (
                  <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                    Transfer to: {c.transferToName} · {c.transferToEmail}
                  </p>
                )}
                {c.adminNotes && (
                  <div className="text-xs mt-3 bg-secondary rounded-lg p-3 border-l-2 border-accent">
                    <span className="font-semibold">Secretariat note:</span> {c.adminNotes}
                  </div>
                )}
                <RequestTimeline req={c} />
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
