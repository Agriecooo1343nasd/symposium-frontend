"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { ScanLine, Download, Search, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatTile } from "@/components/layout/PortalShell";
import {
  useExhibitorProfile,
  useScanExhibitorLead,
  useMyExhibitorLeads,
} from "@/hooks/api/useExhibitor";
import {
  exportLeadsCsv,
  type StoredExhibitorLead,
} from "@/lib/exhibitor/leads-storage";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export default function Page() {
  const { profile } = useExhibitorProfile();
  const { leads: apiLeads, isLoading: leadsLoading } = useMyExhibitorLeads();
  const scanLead = useScanExhibitorLead();
  const [q, setQ] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [consent, setConsent] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leads = apiLeads;
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const rows = leads.filter((l) => {
    if (!q) return true;
    const hay = [l.attendeeName, l.attendeeEmail].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const processScan = useCallback(async () => {
    if (!profile || !scanInput.trim()) return;
    if (!consent) return toast.error("Attendee consent is required");

    const raw = scanInput.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);

    try {
      const result = await scanLead.mutateAsync({
        consentGiven: true,
        ...(isUuid ? { registrationId: raw } : { qrPayload: raw }),
      });
      setSelectedId(result.id);
      setScanInput("");
      toast.success(`Lead captured — ${result.attendeeName ?? result.attendeeEmail ?? "attendee"}`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }, [profile, scanInput, consent, scanLead]);

  const exportCsv = () => {
    const csv = exportLeadsCsv(rows.length ? rows : leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${profile?.companyName ?? "exhibitor"}-leads.csv`;
    a.click();
    toast.success("CSV exported");
  };

  if (!profile) {
    return <p className="text-sm text-muted-foreground">Exhibitor profile not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-40" />
        <div className="relative">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest mb-2">
            <QrCode className="h-4 w-4" /> Lead capture
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">Scan attendee badges</h1>
          <p className="text-white/85 text-sm mt-2 max-w-xl">
            Paste the signed QR payload from an attendee e-ticket or their registration UUID. Scans are saved via the
            API and synchronized across devices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile label="Total leads" value={leads.length} accent />
        <StatTile label="Booth" value={profile.boothNumber ?? "—"} />
        <StatTile label="Package" value={profile.package?.name ?? "Exhibitor"} />
      </div>

      <Tabs defaultValue="scan" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scan">Scan & capture</TabsTrigger>
          <TabsTrigger value="crm">Leads CRM ({leads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-0">
          <div className="rounded-2xl border bg-card p-6 space-y-4 max-w-xl">
            <h2 className="font-serif font-bold">Scan attendee e-ticket</h2>
            <div>
              <Label htmlFor="scan-input">Registration UUID or QR payload</Label>
              <Input
                id="scan-input"
                placeholder="Paste qrData from attendee ticket"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              Attendee gave consent to share contact details
            </label>
            <Button
              className="gradient-blue text-accent-foreground"
              disabled={!scanInput.trim() || scanLead.isPending}
              onClick={() => void processScan()}
            >
              {scanLead.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <ScanLine className="h-4 w-4 mr-1" />
              )}
              Capture lead
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="crm" className="mt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
            <div className="rounded-md border bg-card overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Contact</th>
                    <th className="text-left px-4 py-3">Captured</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr
                      key={l.id}
                      className={`border-t cursor-pointer hover:bg-secondary/40 ${selectedId === l.id ? "bg-accent/10" : ""}`}
                      onClick={() => setSelectedId(l.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{l.attendeeName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{l.attendeeEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(l.scannedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="p-8 text-center text-sm text-muted-foreground">No leads yet. Scan badges on the Scan tab.</p>
              )}
            </div>

            {selected ? (
              <div className="rounded-2xl border bg-card p-5 space-y-3">
                <h3 className="font-serif font-bold">{selected.attendeeName ?? "Lead"}</h3>
                <p className="text-sm text-muted-foreground">{selected.attendeeEmail}</p>
                <div className="text-xs text-muted-foreground">
                  Captured: {new Date(selected.scannedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground hidden lg:block">
                Select a lead to view details.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Booth display QR is on{" "}
        <Link href="/exhibitor/qr" className="text-accent underline">
          Booth QR
        </Link>{" "}
        — separate from attendee lead scans.
      </p>
    </div>
  );
}
