import { loadStore, patchStore, uid, appendAudit, type TicketPlan, type WaitlistEntry } from "./store";
import { getPlatformSettings } from "./platform-settings";

export function getCancellationPolicy() {
  return getPlatformSettings().cancellationPolicyText;
}

export function countRegistrationsForPlan(categoryId: string) {
  return loadStore().registrations.filter(
    (r) => r.categoryId === categoryId && (r.status === "paid" || r.status === "comp"),
  ).length;
}

export function getPlanAvailability(plan: TicketPlan) {
  const sold = countRegistrationsForPlan(plan.id);
  const remaining = Math.max(0, plan.capacity - sold);
  const soldOut = plan.soldOutOverride || remaining <= 0;
  return { sold, remaining, capacity: plan.capacity, soldOut };
}

export function isPlanSoldOut(planId: string) {
  const plan = loadStore().ticketPlans.find((p) => p.id === planId);
  if (!plan) return false;
  return getPlanAvailability(plan).soldOut;
}

export function joinWaitlist(entry: Omit<WaitlistEntry, "id" | "joinedAt" | "notified">) {
  const store = loadStore();
  if (store.waitlist.some((w) => w.email === entry.email && w.categoryId === entry.categoryId)) {
    return { ok: false as const, error: "Already on waitlist for this pass" };
  }
  patchStore((s) => ({
    ...s,
    waitlist: [
      ...s.waitlist,
      { ...entry, id: uid("wl"), joinedAt: new Date().toISOString().slice(0, 10), notified: false },
    ],
  }));
  return { ok: true as const };
}

export function notifyWaitlistEntry(id: string, adminName: string) {
  const entry = loadStore().waitlist.find((w) => w.id === id);
  if (!entry) return;
  patchStore((s) => ({
    ...s,
    waitlist: s.waitlist.map((w) =>
      w.id === id ? { ...w, notified: true, notifiedAt: new Date().toISOString() } : w,
    ),
  }));
  appendAudit(adminName, "Waitlist spot notification sent", entry.email);
}

export function submitCancellationRequest(params: {
  registrationId: string;
  requesterEmail: string;
  requesterName: string;
  type: "refund" | "transfer";
  reason: string;
  transferToName?: string;
  transferToEmail?: string;
}) {
  const reg = loadStore().registrations.find((r) => r.id === params.registrationId);
  if (!reg) return { ok: false as const, error: "Registration not found" };
  const pending = loadStore().cancellationRequests.some(
    (c) => c.registrationId === params.registrationId && c.status === "pending",
  );
  if (pending) return { ok: false as const, error: "A request is already pending for this registration" };

  patchStore((s) => ({
    ...s,
    cancellationRequests: [
      {
        id: uid("cx"),
        registrationId: params.registrationId,
        requesterEmail: params.requesterEmail,
        requesterName: params.requesterName,
        type: params.type,
        reason: params.reason,
        status: "pending",
        transferToName: params.transferToName,
        transferToEmail: params.transferToEmail,
        refundAmountUsd: params.type === "refund" ? reg.amountUsd : undefined,
        createdAt: new Date().toISOString(),
      },
      ...s.cancellationRequests,
    ],
  }));
  return { ok: true as const };
}

export function processCancellationRequest(
  id: string,
  decision: "approved" | "rejected",
  adminName: string,
  adminNotes?: string,
  refundAmountUsd?: number,
) {
  const req = loadStore().cancellationRequests.find((c) => c.id === id);
  if (!req) return;

  patchStore((s) => {
    let registrations = s.registrations;
    if (decision === "approved" && req.type === "refund") {
      registrations = registrations.map((r) =>
        r.id === req.registrationId ? { ...r, status: "pending" as const, amountUsd: 0 } : r,
      );
    }
    if (decision === "approved" && req.type === "transfer" && req.transferToEmail && req.transferToName) {
      registrations = registrations.map((r) =>
        r.id === req.registrationId
          ? { ...r, name: req.transferToName!, email: req.transferToEmail! }
          : r,
      );
    }
    return {
      ...s,
      registrations,
      cancellationRequests: s.cancellationRequests.map((c) =>
        c.id === id
          ? {
              ...c,
              status: decision,
              adminNotes,
              refundAmountUsd: refundAmountUsd ?? c.refundAmountUsd,
              processedBy: adminName,
              processedAt: new Date().toISOString(),
            }
          : c,
      ),
    };
  });
  appendAudit(
    adminName,
    decision === "approved" ? `Approved ${req.type} request` : "Rejected cancellation request",
    req.requesterEmail,
  );
}
