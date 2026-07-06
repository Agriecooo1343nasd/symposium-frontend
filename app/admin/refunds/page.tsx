"use client";

import { useState } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useFinanceRefunds,
  useAdminUpdateRefund,
  useAdminTicketCategories,
  useUpdateTicketCategory,
} from "@/hooks/api/useAdmin";
import { useWaitlistAdmin, usePromoteWaitlist } from "@/hooks/api/useEngage";
import type { FinanceRefundDto, RefundStatus } from "@/lib/api/dto";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

const ACTIONABLE: RefundStatus[] = ["pending", "requested", "secretariat_review"];
const statusLabel: Record<string, string> = {
  pending: "Pending",
  requested: "Requested",
  secretariat_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  processed: "Processed",
  completed: "Completed",
};

export default function Page() {
  const { refunds, isLoading: refundsLoading } = useFinanceRefunds();
  const updateRefund = useAdminUpdateRefund();
  const { entries: waitlist, isLoading: waitlistLoading } = useWaitlistAdmin();
  const promote = usePromoteWaitlist();
  const { categories, isLoading: catsLoading } = useAdminTicketCategories();
  const updateCategory = useUpdateTicketCategory();

  const [review, setReview] = useState<FinanceRefundDto | null>(null);
  const [notes, setNotes] = useState("");

  const pending = refunds.filter((r) => ACTIONABLE.includes(r.status));

  const act = async (status: RefundStatus, requireNote = false) => {
    if (!review) return;
    if (requireNote && !notes.trim()) return toast.error("Add a note for the attendee");
    try {
      await updateRefund.mutateAsync({ id: review.id, dto: { status, adminNotes: notes.trim() || undefined } });
      toast.success(`Refund ${statusLabel[status]?.toLowerCase() ?? status}`);
      setReview(null);
      setNotes("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const promoteEntry = async (id: string) => {
    try {
      await promote.mutateAsync(id);
      toast.success("Waitlist entry promoted — spot offered");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const toggleSoldOut = async (id: string, next: boolean) => {
    try {
      await updateCategory.mutateAsync({ id, dto: { isSoldOut: next } });
      toast.info(next ? "Marked sold out" : "Sold-out cleared");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Refunds, transfers & waitlist</h1>
        <p className="text-muted-foreground">FR-2.7 / FR-2.8 — manual review with audit trail.</p>
      </div>

      <Tabs defaultValue="cancellations">
        <TabsList className="flex-wrap">
          <TabsTrigger value="cancellations">Cancellations ({pending.length})</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist ({waitlist.length})</TabsTrigger>
          <TabsTrigger value="plans">Pass capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="cancellations" className="mt-6">
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-secondary/60 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Attendee</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Reason</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.attendeeName}</div>
                      <div className="text-xs text-muted-foreground">{c.attendeeEmail}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{c.type}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{c.reason}</td>
                    <td className="px-4 py-3">{statusLabel[c.status] ?? c.status}</td>
                    <td className="px-4 py-3 text-right">
                      {ACTIONABLE.includes(c.status) ? (
                        <Button size="sm" variant="outline" onClick={() => { setReview(c); setNotes(c.adminNotes ?? ""); }}>Review</Button>
                      ) : c.status === "approved" ? (
                        <Button size="sm" variant="outline" onClick={() => { setReview(c); setNotes(c.adminNotes ?? ""); }}>Complete</Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {refundsLoading ? (
              <p className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading refund requests…
              </p>
            ) : refunds.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No refund requests.</p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-6 space-y-3">
          {waitlistLoading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading waitlist…
            </p>
          )}
          {waitlist.map((w) => (
            <div key={w.id} className="rounded-xl border bg-card p-4 flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-medium font-mono text-sm">Registration {w.registrationId.slice(0, 8)}</div>
                <div className="text-sm text-muted-foreground">
                  Status: <span className="capitalize">{w.status}</span> · joined {new Date(w.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Button
                size="sm"
                className="gradient-green text-accent-foreground"
                disabled={w.status === "promoted" || promote.isPending}
                onClick={() => promoteEntry(w.id)}
              >
                <Bell className="h-3.5 w-3.5 mr-1" /> {w.status === "promoted" ? "Promoted" : "Promote / offer spot"}
              </Button>
            </div>
          ))}
          {!waitlistLoading && waitlist.length === 0 && <p className="text-sm text-muted-foreground">Waitlist empty.</p>}
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          {catsLoading ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading pass categories…
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((p) => {
                const capacity = p.capacity ?? null;
                const full = p.isSoldOut || (capacity != null && p.soldCount >= capacity);
                return (
                  <div key={p.id} className="rounded-xl border p-4">
                    <div className="font-serif font-bold">{p.name}</div>
                    <div className="text-sm mt-2">
                      {p.soldCount} / {capacity ?? "∞"} sold {full && <span className="text-amber-700 font-semibold">· SOLD OUT</span>}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      disabled={updateCategory.isPending}
                      onClick={() => toggleSoldOut(p.id, !p.isSoldOut)}
                    >
                      {p.isSoldOut ? "Clear sold-out override" : "Mark sold out"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!review} onOpenChange={() => { setReview(null); setNotes(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process refund request</DialogTitle></DialogHeader>
          {review && (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">{review.attendeeName}</div>
                <div className="text-muted-foreground text-xs">{review.attendeeEmail} · {review.type} refund</div>
                <p className="mt-2 text-muted-foreground">{review.reason}</p>
              </div>
              <div>
                <Label>Notes to attendee</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => act("rejected", true)} disabled={updateRefund.isPending}>
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
            {review && ACTIONABLE.includes(review.status) && (
              <Button onClick={() => act("approved")} disabled={updateRefund.isPending} className="gradient-green text-accent-foreground">
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            )}
            <Button onClick={() => act("completed")} disabled={updateRefund.isPending} variant="secondary">
              <Check className="h-4 w-4 mr-1" /> Mark completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
