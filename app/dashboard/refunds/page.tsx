"use client";

import { getSession } from "@/lib/auth";
import { RefundCancellationPanel } from "@/components/registration/RefundCancellationPanel";

export default function DashboardRefundsPage() {
  const session = getSession();
  return (
    <div className="">
      <h1 className="font-serif text-3xl font-bold mb-2">Cancellation & refunds</h1>
      <p className="text-muted-foreground mb-6">
        Request a refund or transfer your NAS 2026 pass. All requests are reviewed manually by the secretariat - track
        status and secretariat notes below.
      </p>
      <RefundCancellationPanel email={session?.email ?? "alice@example.rw"} name={session?.name ?? "Alice Uwimana"} />
    </div>
  );
}
