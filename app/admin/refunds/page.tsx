"use client";

import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import { processCancellationRequest, notifyWaitlistEntry } from "@/lib/registration-ops";
import { getSession } from "@/lib/auth";
import { patchStore } from "@/lib/store";
import { toast } from "sonner";


export default function Page() {
  const store = useStore();
  const session = getSession();
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [refundAmt, setRefundAmt] = useState("");

  const pending = store.cancellationRequests.filter((c) => c.status === "pending");

  const approve = () => {
    if (!reviewId) return;
    const req = store.cancellationRequests.find((c) => c.id === reviewId);
    processCancellationRequest(reviewId, "approved", session?.name ?? "Admin", notes, refundAmt ? Number(refundAmt) : req?.refundAmountUsd);
    toast.success("Request approved and logged");
    setReviewId(null);
    setNotes("");
    setRefundAmt("");
  };

  const reject = () => {
    if (!reviewId || !notes.trim()) return toast.error("Add a note for the attendee");
    processCancellationRequest(reviewId, "rejected", session?.name ?? "Admin", notes);
    toast.info("Request rejected");
    setReviewId(null);
    setNotes("");
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
          <TabsTrigger value="waitlist">Waitlist ({store.waitlist.length})</TabsTrigger>
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
                {store.cancellationRequests.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.requesterName}</div>
                      <div className="text-xs text-muted-foreground">{c.requesterEmail}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{c.type}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{c.reason}</td>
                    <td className="px-4 py-3 capitalize">{c.status}</td>
                    <td className="px-4 py-3 text-right">
                      {c.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => { setReviewId(c.id); setRefundAmt(String(c.refundAmountUsd ?? "")); }}>Review</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-6 space-y-3">
          {store.waitlist.map((w) => (
            <div key={w.id} className="rounded-xl border bg-card p-4 flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-sm text-muted-foreground">{w.email} · {w.categoryName} · joined {w.joinedAt}</div>
              </div>
              <Button
                size="sm"
                className="gradient-blue text-accent-foreground"
                disabled={w.notified}
                onClick={() => {
                  notifyWaitlistEntry(w.id, session?.name ?? "Admin");
                  toast.success(`Spot available email sent to ${w.email}`);
                }}
              >
                <Bell className="h-3.5 w-3.5 mr-1" /> {w.notified ? "Notified" : "Notify spot open"}
              </Button>
            </div>
          ))}
          {store.waitlist.length === 0 && <p className="text-sm text-muted-foreground">Waitlist empty.</p>}
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.ticketPlans.map((p) => {
              const sold = store.registrations.filter((r) => r.categoryId === p.id && (r.status === "paid" || r.status === "comp")).length;
              const full = p.soldOutOverride || sold >= p.capacity;
              return (
                <div key={p.id} className="rounded-xl border p-4">
                  <div className="font-serif font-bold">{p.name}</div>
                  <div className="text-sm mt-2">{sold} / {p.capacity} sold {full && <span className="text-amber-700 font-semibold">· SOLD OUT</span>}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => {
                      patchStore((s) => ({
                        ...s,
                        ticketPlans: s.ticketPlans.map((t) =>
                          t.id === p.id ? { ...t, soldOutOverride: !t.soldOutOverride } : t,
                        ),
                      }));
                      toast.info(full ? "Override cleared" : "Marked sold out");
                    }}
                  >
                    Toggle sold-out override
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!reviewId} onOpenChange={() => setReviewId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Refund amount (USD)</Label><Input type="number" value={refundAmt} onChange={(e) => setRefundAmt(e.target.value)} className="mt-1" /></div>
            <div><Label>Notes to attendee *</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={reject}><X className="h-4 w-4 mr-1" /> Reject</Button>
            <Button onClick={approve} className="gradient-blue text-accent-foreground"><Check className="h-4 w-4 mr-1" /> Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
