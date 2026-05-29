"use client";

import Link from "next/link";
import { Users, FileCheck, Mic, ScanLine, Store, CheckCircle } from "lucide-react";
import { useStore } from "@/hooks/use-store";

export default function DeskOverviewPage() {
  const store = useStore();
  const pendingVerifications = store.documentVerifications.filter((d) => d.status === "pending");
  const pendingSpeakers = store.speakerApplications.filter((s) => s.status === "pending");
  const pendingOrgs = store.organizationApplications.filter((o) => o.status === "pending");
  const paidRegs = store.registrations.filter((r) => r.status === "paid");
  const checkedIn = store.registrations.filter((r) => r.checkedIn).length;
  const todayScans = store.checkInScans.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Registration Desk</h1>
        <p className="text-muted-foreground">Registrations, document verification, applications, and venue check-in.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Paid registrations", value: paidRegs.length, sub: `${checkedIn} checked in` },
          { label: "Pending verifications", value: pendingVerifications.length, sub: "Student & farmer docs" },
          { label: "Speaker applications", value: pendingSpeakers.length, sub: "Awaiting review" },
          { label: "Org applications", value: pendingOrgs.length, sub: "Exhibitor & sponsor" },
        ].map((s) => (
          <div key={s.label} className="rounded-md bg-card border border-border p-4">
            <div className="font-serif text-2xl font-bold">{s.value}</div>
            <div className="text-sm font-medium">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-md bg-card border border-border p-5">
          <h2 className="font-serif font-bold mb-3 flex items-center gap-2">
            <ScanLine className="h-4 w-4" /> Check-in today
          </h2>
          <div className="font-serif text-3xl font-bold">{todayScans}</div>
          <p className="text-sm text-muted-foreground mt-1">Scans recorded this session</p>
          <Link href="/desk/checkin" className="text-sm text-accent font-semibold mt-3 inline-block">
            Open QR scanner →
          </Link>
        </div>
        <div className="rounded-md bg-card border border-border p-5">
          <h2 className="font-serif font-bold mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { to: "/desk/registrations", label: "View registrations", icon: Users },
              { to: "/desk/verifications", label: "Verify documents", icon: FileCheck },
              { to: "/desk/applications", label: "Review applications", icon: Mic },
              { to: "/desk/checkin", label: "Scan badges", icon: ScanLine },
            ].map((a) => (
              <Link
                key={a.to}
                href={a.to}
                className="rounded-md border border-border p-3 hover:bg-secondary/50 flex items-center gap-2"
              >
                <a.icon className="h-4 w-4 text-blue" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-md bg-card border border-border p-5">
        <h2 className="font-serif font-bold mb-3">Recent check-ins</h2>
        {store.checkInScans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scans yet — use the check-in station at the venue entrance.</p>
        ) : (
          <ul className="space-y-2">
            {store.checkInScans.slice(0, 6).map((s) => (
              <li key={s.id} className="text-sm flex justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span>
                  <CheckCircle className="h-3.5 w-3.5 inline text-green mr-1" />
                  {s.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {s.scanType.replace("_", " ")} · {s.scannedAt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: "/desk/registrations", label: "Registrations", value: paidRegs.length, icon: Users },
          { to: "/desk/verifications", label: "Verifications", value: pendingVerifications.length, icon: FileCheck },
          {
            to: "/desk/applications",
            label: "Applications",
            value: pendingSpeakers.length + pendingOrgs.length,
            icon: Store,
          },
        ].map((c) => (
          <Link key={c.to} href={c.to} className="rounded-md bg-card border border-border p-5 hover-lift">
            <c.icon className="h-6 w-6 text-blue mb-2" />
            <div className="font-serif text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
