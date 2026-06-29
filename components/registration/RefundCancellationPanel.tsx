"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, FileText, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCancellationPolicy } from "@/lib/registration-ops";
import { cn } from "@/lib/utils";
import type { RefundRequestDto, RefundStatus } from "@/lib/api/dto";
import { toast } from "sonner";
import { useMyRegistrations } from "@/hooks/api/useRegistration";
import { useCreateRefund, useMyRefunds } from "@/hooks/api/useDashboard";
import {
  isRegistrationPaid,
  primaryRegistration,
  registrationCategoryLabel,
  registrationStatusLabel,
} from "@/lib/api/mappers/registration-helpers";
import { apiErrorMessage } from "@/lib/api/client";

const STEPS = [
  { key: "submit", label: "Submit request" },
  { key: "review", label: "Secretariat review" },
  { key: "decision", label: "Approved or declined" },
  { key: "payout", label: "Refund completed" },
] as const;

type StepState = "done" | "active" | "upcoming" | "failed";

function getStepState(index: number, req: RefundRequestDto): StepState {
  const pending = ["pending", "requested", "secretariat_review"].includes(req.status);
  if (pending) {
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

function StatusBadge({ status }: { status: RefundStatus }) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0",
        (status === "approved" || status === "completed" || status === "processed") && "bg-green/15 text-green",
        status === "rejected" && "bg-red-100 text-red-700",
        ["pending", "requested", "secretariat_review"].includes(status) && "bg-amber-100 text-amber-800",
      )}
    >
      {label}
    </span>
  );
}

function RequestTimeline({ req }: { req: RefundRequestDto }) {
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
                  <div className={cn("w-0.5 flex-1 min-h-[20px] my-0.5", done ? "bg-green/40" : "bg-border")} />
                )}
              </div>
              <div className={cn("pb-4 min-w-0", i === STEPS.length - 1 && "pb-0")}>
                <div className="text-sm font-medium">{step.label}</div>
                {i === 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submitted {new Date(req.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
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

export function RefundCancellationPanel() {
  const policy = getCancellationPolicy();
  const { registrations, isLoading: regsLoading } = useMyRegistrations();
  const { data: myRequests = [], isLoading: refundsLoading } = useMyRefunds();
  const createRefund = useCreateRefund();

  const reg = primaryRegistration(registrations);
  const sorted = [...myRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hasPending = sorted.some((c) => ["pending", "requested", "secretariat_review"].includes(c.status));
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [reason, setReason] = useState("");

  if (regsLoading || refundsLoading) {
    return <div className="text-muted-foreground py-8">Loading refund information…</div>;
  }

  if (!reg || !isRegistrationPaid(reg)) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        No paid registration found for this account.{" "}
        <Link href="/register" className="text-accent font-semibold hover:underline">
          Register first
        </Link>{" "}
        to manage cancellations.
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Please provide a reason");
    try {
      await createRefund.mutateAsync({
        registrationId: reg.id,
        type: refundType,
        reason: reason.trim(),
      });
      toast.success("Refund request submitted — the secretariat will review it");
      setReason("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
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
            {registrationCategoryLabel(reg)} · {registrationStatusLabel(reg.status)}
          </div>
        </div>
        <div className="text-right shrink-0">
          {reg.amountUsd != null && <div className="font-mono text-lg font-bold">${reg.amountUsd}</div>}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 text-sm text-amber-950 leading-relaxed">
        <div className="font-semibold text-xs uppercase tracking-wider mb-2">Cancellation & refund policy</div>
        {policy}
      </div>

      <div className="rounded-xl border border-blue/20 bg-blue/5 p-4 text-sm text-muted-foreground">
        Pass transfers to another delegate must be arranged through the secretariat —{" "}
        <Link href="/contact" className="text-accent font-semibold hover:underline">
          contact us
        </Link>{" "}
        with the new attendee&apos;s details.
      </div>

      <Tabs defaultValue={hasPending ? "history" : "request"}>
        <TabsList>
          <TabsTrigger value="request">New request</TabsTrigger>
          <TabsTrigger value="history">Track requests ({sorted.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-4">
          {hasPending && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-950 mb-4">
              You already have a request under review. Check <strong>Track requests</strong> for updates.
            </div>
          )}
          <form
            onSubmit={submit}
            className={cn(
              "rounded-2xl border bg-card p-4 sm:p-6 space-y-4 max-w-xl",
              hasPending && "opacity-60 pointer-events-none",
            )}
          >
            <div>
              <Label>Refund type</Label>
              <Select value={refundType} onValueChange={(v) => setRefundType(v as "full" | "partial")} disabled={hasPending}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full refund</SelectItem>
                  <SelectItem value="partial">Partial refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-1"
                required
                placeholder="Explain your situation (visa issues, medical, schedule conflict…)"
                disabled={hasPending}
              />
            </div>
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={hasPending || createRefund.isPending}>
              <Send className="h-4 w-4 mr-1" /> {createRefund.isPending ? "Submitting…" : "Submit for review"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-xl border p-6 text-center">
              No requests yet. Use <strong>New request</strong> to request a refund.
            </p>
          ) : (
            sorted.map((c) => (
              <div key={c.id} className="rounded-2xl border bg-card p-4 sm:p-5 text-sm shadow-sm">
                <div className="flex flex-wrap justify-between gap-2 items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold capitalize">{c.type} refund</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">Ref {c.id.slice(0, 8)}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 leading-relaxed">{c.reason}</p>
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
