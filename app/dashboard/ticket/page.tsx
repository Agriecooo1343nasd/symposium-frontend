"use client";

import Link from "next/link";
import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";

export default function DashboardTicketPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Your e-ticket</h1>
      <p className="text-muted-foreground mb-6">Show this QR code at the registration desk on arrival.</p>
      <TicketCard />
      <div className="mt-8 rounded-xl border bg-secondary/40 p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Need to cancel, request a refund, or transfer your pass?</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/refunds">Refunds & transfer</Link>
        </Button>
      </div>
    </div>
  );
}
