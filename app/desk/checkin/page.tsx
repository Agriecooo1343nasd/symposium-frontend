"use client";

import { useState, useRef } from "react";
import { ScanLine, Check, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useManualCheckIn, useQrCheckIn } from "@/hooks/api/useDesk";
import { toast } from "sonner";
import type { AttendanceCheckInResponseDto } from "@/lib/api/dto";

type ScanLog = AttendanceCheckInResponseDto & { label?: string };

export default function DeskCheckinPage() {
  const [qrInput, setQrInput] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualRegId, setManualRegId] = useState("");
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string; name?: string } | null>(null);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const qrRef = useRef<HTMLInputElement>(null);
  const qrCheckIn = useQrCheckIn();
  const manualCheckIn = useManualCheckIn();

  const recordSuccess = (res: AttendanceCheckInResponseDto, label?: string) => {
    setScans((prev) => [{ ...res, label }, ...prev]);
    setLastResult({
      ok: true,
      message: "Checked in successfully.",
      name: label ?? res.registrationId.slice(0, 8),
    });
    toast.success("Check-in recorded");
  };

  const recordError = (message: string) => {
    setLastResult({ ok: false, message });
    toast.error(message);
  };

  const submitQr = (e: React.FormEvent) => {
    e.preventDefault();
    const qrData = qrInput.trim();
    if (!qrData) return toast.error("Paste or scan the QR payload");
    qrCheckIn.mutate(
      { qrData },
      {
        onSuccess: (res) => {
          recordSuccess(res);
          setQrInput("");
          qrRef.current?.focus();
        },
        onError: (err) => recordError(err instanceof Error ? err.message : "Invalid QR"),
      },
    );
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const email = manualEmail.trim();
    const registrationId = manualRegId.trim();
    if (!email && !registrationId) return toast.error("Enter email or registration ID");
    manualCheckIn.mutate(
      { email: email || undefined, registrationId: registrationId || undefined },
      {
        onSuccess: (res) => {
          recordSuccess(res, email || registrationId);
          setManualEmail("");
          setManualRegId("");
        },
        onError: (err) => recordError(err instanceof Error ? err.message : "Check-in failed"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Venue check-in</h1>
        <p className="text-muted-foreground">
          Scan the signed QR payload from attendee tickets or check in manually by email / registration ID.
        </p>
      </div>

      <Tabs defaultValue="qr">
        <TabsList>
          <TabsTrigger value="qr">QR scan</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-md bg-card border border-border p-6 space-y-4">
              <div className="aspect-square max-w-sm mx-auto rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center bg-secondary/30">
                <ScanLine className="h-16 w-16 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  Camera scanner activates here in production. Paste the full signed QR string below.
                </p>
              </div>
              <form onSubmit={submitQr} className="space-y-3">
                <div>
                  <Label>Signed QR payload</Label>
                  <Input
                    ref={qrRef}
                    placeholder="Paste base64url QR data from ticket"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    className="mt-1 font-mono text-xs"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-blue text-accent-foreground"
                  disabled={qrCheckIn.isPending}
                >
                  <ScanLine className="h-4 w-4 mr-1" /> Verify & check in
                </Button>
              </form>
            </div>
            <ResultPanel lastResult={lastResult} scans={scans} />
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <form onSubmit={submitManual} className="rounded-md bg-card border border-border p-6 space-y-4">
              <div>
                <Label>Delegate email</Label>
                <Input
                  type="email"
                  placeholder="delegate@example.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="text-center text-xs text-muted-foreground">or</div>
              <div>
                <Label>Registration ID (UUID)</Label>
                <Input
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={manualRegId}
                  onChange={(e) => setManualRegId(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
              </div>
              <Button type="submit" className="w-full" disabled={manualCheckIn.isPending}>
                Check in manually
              </Button>
            </form>
            <ResultPanel lastResult={lastResult} scans={scans} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResultPanel({
  lastResult,
  scans,
}: {
  lastResult: { ok: boolean; message: string; name?: string } | null;
  scans: ScanLog[];
}) {
  return (
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
          <Users className="h-4 w-4" /> Session scans ({scans.length})
        </h2>
        {scans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-ins this session yet.</p>
        ) : (
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {scans.map((s) => (
              <li key={s.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div className="font-medium">{s.label ?? s.registrationId.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">
                  {s.method.replace(/_/g, " ")} · {new Date(s.checkedInAt).toLocaleTimeString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
