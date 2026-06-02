"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { VerificationReviewList } from "@/components/desk/VerificationReview";
import { SpeakerAppReviewList } from "@/components/desk/SpeakerAppReview";
import { Button } from "@/components/ui/button";


export default function Page() {
  const store = useStore();
  const pendingRegs = store.registrations.filter((r) => r.status === "pending").length;
  const pendingVer = store.documentVerifications.filter((v) => v.status === "pending").length;
  const pendingSpk = store.speakerApplications.filter((a) => a.status === "pending").length;
  const pendingOrg = store.organizationApplications.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Registration Desk audit</h1>
          <p className="text-muted-foreground">Read-only mirror of desk queues — use desk portal for check-in scans.</p>
        </div>
        <Link href="/desk">
          <Button variant="outline" size="sm">Open desk portal</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Pending payments", n: pendingRegs },
          { label: "Doc verifications", n: pendingVer },
          { label: "Speaker apps", n: pendingSpk },
          { label: "Exhibitor apps", n: pendingOrg },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
            <div className="font-serif text-2xl font-bold">{s.n}</div>
            <div className="text-xs text-muted-foreground uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="verifications">
        <TabsList className="flex-wrap">
          <TabsTrigger value="verifications">Verifications ({pendingVer})</TabsTrigger>
          <TabsTrigger value="speakers">Speaker apps ({pendingSpk})</TabsTrigger>
          <TabsTrigger value="orgs">Exhibitor apps ({pendingOrg})</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
        </TabsList>
        <TabsContent value="verifications" className="mt-6">
          <VerificationReviewList items={store.documentVerifications} readOnly />
        </TabsContent>
        <TabsContent value="speakers" className="mt-6">
          <SpeakerAppReviewList apps={store.speakerApplications} readOnly />
        </TabsContent>
        <TabsContent value="orgs" className="mt-6 space-y-3">
          {store.organizationApplications.map((a) => (
            <div key={a.id} className="rounded-xl border p-4 text-sm">
              <div className="font-medium">{a.companyName}</div>
              <div className="text-muted-foreground capitalize">{a.participation} · {a.status}</div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="registrations" className="mt-6">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase">
                <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Verification</th></tr>
              </thead>
              <tbody>
                {store.registrations.slice(0, 50).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{r.name}<div className="text-xs text-muted-foreground">{r.email}</div></td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3">{r.verificationStatus ?? "none"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="checkins" className="mt-6">
          {store.checkInScans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No check-in scans recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {store.checkInScans.map((s) => (
                <li key={s.id} className="rounded-lg border px-4 py-2">
                  {s.name} · {s.scanType} · {s.scannedAt}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
