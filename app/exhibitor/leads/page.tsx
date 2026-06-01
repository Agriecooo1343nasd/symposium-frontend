"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  ScanLine,
  Download,
  Search,
  QrCode,
  Filter,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatTile } from "@/components/layout/PortalShell";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { patchStore, getExhibitorOrgId, type ExhibitorLead } from "@/lib/store";
import {
  resolveAttendeeFromQr,
  exhibitorHasLeadCapture,
  getLeadAnalytics,
  exportLeadsCsv,
  DEMO_ATTENDEE_TICKETS,
  type ResolvedAttendee,
} from "@/lib/lead-capture";
import { LeadCaptureDialog } from "@/components/exhibitor/LeadCaptureDialog";
import { LeadDetailPanel } from "@/components/exhibitor/LeadDetailPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


const statusColor = (s: string) =>
  s === "Converted"
    ? "bg-green/15 text-green"
    : s === "In Discussion"
      ? "bg-blue/15 text-blue"
      : s === "Contacted"
        ? "bg-amber-100 text-amber-800"
        : "bg-zinc-100 text-zinc-700";

export default function Page() {
  const store = useStore();
  const { session } = useAuth();
  const orgId = getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === orgId);
  const hasCapture = exhibitorHasLeadCapture(orgId);

  const analytics = useMemo(() => getLeadAnalytics(orgId), [store.exhibitorLeads, orgId]);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [scanInput, setScanInput] = useState("");
  const [pendingAttendee, setPendingAttendee] = useState<ResolvedAttendee | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = analytics.leads.find((l) => l.id === selectedId) ?? null;

  const countries = useMemo(
    () => ["all", ...Array.from(new Set(analytics.leads.map((l) => l.country))).sort()],
    [analytics.leads],
  );

  const rows = analytics.leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (countryFilter !== "all" && l.country !== countryFilter) return false;
    if (!q) return true;
    const hay = [l.name, l.org, l.interest, l.email, l.boothNotes, ...(l.interests ?? [])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const processScan = (raw: string) => {
    const res = resolveAttendeeFromQr(raw);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    setPendingAttendee(res);
    setCaptureOpen(true);
  };

  const saveLeadEdit = (lead: ExhibitorLead) => {
    patchStore((s) => ({
      ...s,
      exhibitorLeads: s.exhibitorLeads.map((l) => (l.id === lead.id ? lead : l)),
    }));
    toast.success("Lead updated");
  };

  const exportCsv = () => {
    const csv = exportLeadsCsv(rows.length ? rows : analytics.leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${org?.name ?? "exhibitor"}-leads.csv`;
    a.click();
    toast.success("CSV exported");
  };

  if (!hasCapture) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="font-serif text-3xl font-bold">Lead capture</h1>
        <div className="rounded-2xl border bg-amber-50 border-amber-200 p-6 text-sm">
          <p className="font-semibold text-amber-950">Not included in your package</p>
          <p className="mt-2 text-amber-900">
            QR lead capture is available on Gold and Platinum sponsorship tiers (FR-5.2). Upgrade via{" "}
            <Link href="/exhibitor/sponsorship" className="text-accent font-medium underline">
              Sponsorship
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl gradient-navy grain-overlay text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-40" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest mb-2">
              <QrCode className="h-4 w-4" /> FR-5.2 · Lead capture
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">Scan attendee badges</h1>
            <p className="text-white/85 text-sm mt-2 max-w-xl">
              When a delegate visits booth {org?.booth}, scan their e-ticket QR. With consent, their registration
              profile becomes a lead — add booth notes for your sales follow-up.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-gold text-navy hover:bg-gold/90 font-semibold shrink-0"
            onClick={() => document.getElementById("scan-panel")?.scrollIntoView({ behavior: "smooth" })}
          >
            <ScanLine className="h-5 w-5 mr-2" /> Start scanning
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total leads captured" value={analytics.total} accent />
        <StatTile label="Top interest" value={analytics.topInterest} hint="from sub-themes" />
        <StatTile label="Most active" value={analytics.mostActiveDay} />
        <StatTile label="Converted" value={analytics.converted} hint={`${analytics.contacted} in pipeline`} />
      </div>

      <Tabs defaultValue="scan" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scan">Scan & capture</TabsTrigger>
          <TabsTrigger value="crm">Leads CRM ({analytics.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-0">
          <div id="scan-panel" className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
            <div className="rounded-2xl border bg-card p-6 space-y-5">
              <h2 className="font-serif font-bold text-lg">Scan attendee e-ticket</h2>
              <p className="text-sm text-muted-foreground">
                Ask the delegate to open <strong>Dashboard → E-ticket</strong> and show their QR code. Paste the
                ticket ID below or use a demo scan in this prototype.
              </p>

              <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-8 flex flex-col items-center text-center">
                <ScanLine className="h-12 w-12 text-accent mb-3" />
                <p className="text-sm font-medium">Camera scanner</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Production builds use the device camera. For the demo, paste a ticket ID or pick a sample attendee.
                </p>
              </div>

              <div>
                <Label htmlFor="scan-input">Ticket ID or QR payload</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="scan-input"
                    placeholder="NAS26-R1-1000"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && scanInput && processScan(scanInput)}
                    className="font-mono"
                  />
                  <Button
                    className="gradient-blue text-accent-foreground shrink-0"
                    onClick={() => scanInput && processScan(scanInput)}
                  >
                    Scan
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Quick demo scans</Label>
                <div className="grid gap-2 mt-2">
                  {DEMO_ATTENDEE_TICKETS.map((d) => (
                    <Button
                      key={d.payload}
                      type="button"
                      variant="outline"
                      className="justify-between h-auto py-2 text-left"
                      onClick={() => processScan(d.payload)}
                    >
                      <span className="text-sm">{d.label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-serif font-bold text-sm mb-3 flex items-center gap-2">
                How it works
                </h3>
                <ol className="space-y-3 text-sm">
                  {[
                    "Attendee visits your booth",
                    "You scan their badge QR (e-ticket)",
                    "Platform checks privacy consent",
                    "You add booth notes & save the lead",
                    "Follow up from the CRM tab — export CSV anytime",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="h-6 w-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-xl bg-secondary/40 border p-4 text-xs text-muted-foreground">
                Your booth display QR for registration desk is on{" "}
                <Link href="/exhibitor/qr" className="text-accent font-medium underline">
                  Booth QR
                </Link>{" "}
                — that code is not used for lead capture.
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="crm" className="mt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, org, notes, interests…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-3.5 w-3.5 mr-1 opacity-50" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(["None", "Contacted", "In Discussion", "Converted"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "All countries" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
            <div className="rounded-md border bg-card overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Contact</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Interests</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Booth notes</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Captured</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr
                      key={l.id}
                      className={cn(
                        "border-t cursor-pointer transition-colors",
                        selectedId === l.id ? "bg-accent/10" : "hover:bg-secondary/40",
                      )}
                      onClick={() => setSelectedId(l.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.org}</div>
                        <div className="text-xs text-muted-foreground">{l.email}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs max-w-[140px]">
                        <span className="line-clamp-2">{(l.interests ?? []).join(", ") || l.interest}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground max-w-[200px]">
                        <span className="line-clamp-2">{l.boothNotes || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded", statusColor(l.status))}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{l.capturedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No leads match your filters. Scan badges on the Scan & capture tab.
                </p>
              )}
            </div>

            {selected ? (
              <LeadDetailPanel
                lead={selected}
                onChange={(l) => {
                  saveLeadEdit(l);
                  setSelectedId(l.id);
                }}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground hidden lg:block">
                Select a lead to view full contact details, booth notes, and contact history.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <LeadCaptureDialog
        open={captureOpen}
        onOpenChange={setCaptureOpen}
        attendee={pendingAttendee}
        orgId={orgId}
        scannedBy={session?.name}
        onSaved={(lead, updated) => {
          toast.success(updated ? `${lead.name} — notes updated` : `Lead saved — ${lead.name}`);
          setSelectedId(lead.id);
        }}
      />
    </div>
  );
}
