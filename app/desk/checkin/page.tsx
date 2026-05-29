"use client";

import { useState, useRef } from "react";
import { ScanLine, Check, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, findRegistrationByTicketId } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

export default function DeskCheckinPage() {
  const store = useStore();
  const session = getSession();
  const [ticketInput, setTicketInput] = useState("");
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string; name?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const performScan = (ticketId: string, scanType: "delegate" | "exhibitor_staff" | "booth_comp" = "delegate") => {
    const tid = ticketId.trim().toUpperCase();
    if (!tid) return toast.error("Enter or scan a ticket ID");

    const reg = findRegistrationByTicketId(tid);
    const staff = store.exhibitorStaff.find(
      (s) => s.inviteToken === tid.toLowerCase() || `STAFF-${s.id}`.toUpperCase() === tid,
    );
    const org = store.approvedOrganizations.find(
      (o) => `BOOTH-${o.booth}`.toUpperCase() === tid || `ORG-${o.id}`.toUpperCase() === tid,
    );

    if (reg) {
      if (reg.verificationStatus === "pending") {
        setLastResult({ ok: false, message: "Paid but document verification still pending.", name: reg.name });
        return toast.error("Verification pending");
      }
      patchStore((s) => ({
        ...s,
        registrations: s.registrations.map((r) =>
          r.details?.ticketId === tid
            ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString(), checkInType: scanType }
            : r,
        ),
        checkInScans: [
          {
            id: uid("scan"),
            ticketId: tid,
            name: reg.name,
            email: reg.email,
            category: reg.category,
            scanType: "delegate",
            scannedAt: new Date().toLocaleTimeString(),
            scannedBy: session?.name ?? "Desk",
          },
          ...s.checkInScans,
        ],
      }));
      setLastResult({ ok: true, message: "Delegate checked in successfully.", name: reg.name });
      toast.success(`Welcome, ${reg.name}!`);
    } else if (staff) {
      patchStore((s) => ({
        ...s,
        checkInScans: [
          {
            id: uid("scan"),
            ticketId: tid,
            name: staff.name,
            email: staff.email,
            category: "Exhibitor staff pass",
            scanType: "exhibitor_staff",
            scannedAt: new Date().toLocaleTimeString(),
            scannedBy: session?.name ?? "Desk",
            orgName: store.approvedOrganizations.find((o) => o.id === staff.orgId)?.name,
          },
          ...s.checkInScans,
        ],
      }));
      setLastResult({ ok: true, message: "Exhibitor staff pass valid (booth comp).", name: staff.name });
      toast.success(`Staff checked in: ${staff.name}`);
    } else if (org) {
      patchStore((s) => ({
        ...s,
        checkInScans: [
          {
            id: uid("scan"),
            ticketId: tid,
            name: org.name,
            email: org.contact,
            category: "Booth companion",
            scanType: "booth_comp",
            scannedAt: new Date().toLocaleTimeString(),
            scannedBy: session?.name ?? "Desk",
            orgName: org.name,
          },
          ...s.checkInScans,
        ],
      }));
      setLastResult({ ok: true, message: "Organization booth pass accepted.", name: org.name });
      toast.success(`Booth entry: ${org.name}`);
    } else {
      setLastResult({
        ok: false,
        message: "Ticket not found. Try NAS26-* delegate ID, STAFF-* or BOOTH-* codes.",
      });
      toast.error("Invalid ticket");
    }
    setTicketInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Venue check-in</h1>
        <p className="text-muted-foreground">
          Scan delegate QR codes, exhibitor staff passes, or booth companion codes from sponsoring organizations.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-md bg-card border border-border p-6 space-y-4">
          <div className="aspect-square max-w-sm mx-auto rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center bg-secondary/30">
            <ScanLine className="h-16 w-16 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground text-center px-4">
              Camera scanner activates here in production. Enter ticket ID below to simulate.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performScan(ticketInput);
            }}
            className="space-y-3"
          >
            <div>
              <Label>Ticket / QR payload</Label>
              <Input
                ref={inputRef}
                placeholder="e.g. NAS26-R1-1028, STAFF-st1, BOOTH-A-12"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                className="mt-1 font-mono"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full gradient-blue text-accent-foreground">
              <ScanLine className="h-4 w-4 mr-1" /> Verify & check in
            </Button>
          </form>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Demo IDs from seeded data:</p>
            <button
              type="button"
              className="font-mono text-accent hover:underline block"
              onClick={() => performScan("NAS26-R1-1000")}
            >
              NAS26-R1-1000 (Alice)
            </button>
            <button
              type="button"
              className="font-mono text-accent hover:underline block"
              onClick={() => performScan("STAFF-st3")}
            >
              STAFF-st3 (exhibitor staff)
            </button>
            <button
              type="button"
              className="font-mono text-accent hover:underline block"
              onClick={() => performScan("BOOTH-A-12")}
            >
              BOOTH-A-12 (booth comp)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {lastResult && (
            <div
              className={`rounded-md border p-5 flex gap-3 ${lastResult.ok ? "border-green/40 bg-green/5" : "border-amber-300 bg-amber-50"}`}
            >
              {lastResult.ok ? (
                <Check className="h-6 w-6 text-green shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-700 shrink-0" />
              )}
              <div>
                <div className="font-semibold">{lastResult.name ?? "Scan result"}</div>
                <p className="text-sm mt-1">{lastResult.message}</p>
              </div>
            </div>
          )}

          <div className="rounded-md bg-card border border-border p-5">
            <h2 className="font-serif font-bold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Today&apos;s scans ({store.checkInScans.length})
            </h2>
            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {store.checkInScans.map((s) => (
                <li key={s.id} className="text-sm border-b border-border pb-2 last:border-0">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.ticketId} · {s.scanType.replace("_", " ")} · {s.scannedAt}
                    {s.orgName && ` · ${s.orgName}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
