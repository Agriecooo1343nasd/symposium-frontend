"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Send, Plus, Download, ScanLine, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/layout/PortalShell";
import { DAILY_REGS, CHECKINS } from "@/lib/mock-data";
import { useAdminRegistrations, useFinanceSummary, useAdminSubmissions } from "@/hooks/api/useAdmin";
import { useMediaAccreditationStats } from "@/hooks/api/useMediaAccreditation";
import { useExhibitorApplicationStats, useSponsorshipApplicationStats } from "@/hooks/api/useExhibitor";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { submissionReviewStatus } from "@/lib/api/mappers/desk";
import { useStore } from "@/hooks/use-store";
import { getEventConfig } from "@/lib/platform-settings";
import { AnnouncementDialog } from "@/components/admin/AnnouncementDialog";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";
import { getFinanceSummary } from "@/lib/finance-records";
import { toast } from "sonner";
import { registrationCategoryLabel } from "@/lib/api/mappers/registration-helpers";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";


const COLORS = ["hsl(var(--blue))", "hsl(var(--green))", "hsl(var(--gold))", "hsl(var(--navy))", "hsl(var(--blue-light))", "#e85d3a"];

export default function AdminOverview() {
  const { registrations } = useAdminRegistrations({ limit: 200 });
  const financeApi = useFinanceSummary();
  const { submissions } = useAdminSubmissions({ limit: 100 });
  const mediaStats = useMediaAccreditationStats();
  const symposiumId = useSymposiumId();
  const { stats: exhibitorAppStats } = useExhibitorApplicationStats(symposiumId || undefined);
  const { data: sponsorshipAppStats } = useSponsorshipApplicationStats(symposiumId || undefined);
  const store = useStore();
  const event = getEventConfig();
  const [annOpen, setAnnOpen] = useState(false);
  const [regOpen, setRegOpen] = useState(false);

  useAdminCommandAction({
    "manual-registration": () => setRegOpen(true),
    "new-announcement": () => setAnnOpen(true),
    "send-announcement": () => setAnnOpen(true),
  });

  const regs = registrations;
  const paid = regs.filter((r) => ["active", "paid", "confirmed"].includes(r.status));
  const pending = regs.filter((r) => r.status === "pending_payment");
  const revenue = financeApi.data?.totalRevenue ?? paid.reduce((a, b) => a + (b.amountUsd ?? 0), 0);
  const pendingValue = pending.reduce((a, b) => a + (b.amountUsd ?? 0), 0);
  const pendingApps = submissions.filter((s) => submissionReviewStatus(s.status) === "pending").length;
  const reviewAbs = pendingApps;

  const finance = getFinanceSummary();
  const methodData = finance.methodData;
  const catData = store.ticketPlans.map((c) => ({
    name: c.name.split(" ")[0],
    value: regs.filter((r) => r.ticketCategoryId === c.id).length || 0,
  }));
  const funnelData = DAILY_REGS.map((d) => ({ day: d.day.split(" ")[1], visits: d.regs * 8, regs: d.regs }));

  const exportCsv = () => {
    toast.error("Use the Registrations page to export data.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Symposium command centre</h1>
          <p className="text-muted-foreground">{event.shortName} · live snapshot · {new Date().toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRegOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Manual registration</Button>
          <Button variant="outline" size="sm" onClick={() => setAnnOpen(true)}><Send className="h-3.5 w-3.5 mr-1" /> Send announcement</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-3.5 w-3.5 mr-1" /> Export CSV</Button>
        </div>
      </div>
      <AnnouncementDialog open={annOpen} onOpenChange={setAnnOpen} />
      <ManualRegistrationDialog open={regOpen} onOpenChange={setRegOpen} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total registrations" value={regs.length} trend="+18%" hint="vs last week" accent />
        <StatTile label="Revenue collected" value={`$${revenue.toLocaleString()}`} hint={`RWF ${(revenue * event.exchangeRate).toLocaleString()}`} trend="+22%" />
        <StatTile label="Pending payments" value={pending.length} hint={`$${pendingValue.toLocaleString()} at risk`} />
        <StatTile label="Confirmed attendees" value={paid.length} hint="paid + verified" trend="+18%" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Abstracts received" value={store.speakerAbstracts.length} />
        <StatTile label="Exhibitor profiles" value={store.approvedOrganizations.length} hint="all tiers active" />
        <StatTile label="Checked in today" value={CHECKINS.length} hint="live" />
        <StatTile label="Waitlisted" value={3} hint="across categories" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold">Daily registrations vs goal</h2>
            <span className="text-xs text-muted-foreground">last 11 days</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={DAILY_REGS}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="goal" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="regs" stroke="hsl(var(--blue))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Revenue by method</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={methodData} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {methodData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 text-xs">
            {methodData.map((m, i) => (
              <div key={m.name} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />{m.name}</span><span className="font-mono">${m.value.toLocaleString()}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Registrations by category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="value" fill="hsl(var(--blue))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Visits → registrations funnel</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={funnelData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="visits" stroke="hsl(var(--blue-light))" fill="hsl(var(--blue-light) / 0.2)" />
              <Area type="monotone" dataKey="regs" stroke="hsl(var(--green))" fill="hsl(var(--green) / 0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold">Recent registrations</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/registrations">All <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
          </div>
          <div className="space-y-2">
            {regs.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate font-mono text-xs">{r.id.slice(0, 8)}…</div>
                  <div className="text-xs text-muted-foreground truncate">{registrationCategoryLabel(r)}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize bg-secondary">{r.status.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold">Recent payments</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/finance">All <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
          </div>
          <div className="space-y-2">
            {finance.items.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0"><div className="font-medium truncate">{t.payer}</div><div className="text-xs text-muted-foreground capitalize">{t.kind} · {t.method}</div></div>
                <div className="text-right"><div className="font-mono text-xs">${t.amountUsd.toLocaleString()}</div><div className={`text-[10px] uppercase font-bold ${t.status === "completed" || t.status === "paid" ? "text-green" : t.status === "pending" || t.status === "issued" ? "text-amber-700" : t.status === "refunded" ? "text-blue" : "text-red-700"}`}>{t.status}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4 text-amber-700" /><h2 className="font-serif font-bold text-amber-900">Needs your action</h2></div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Pending payments</span><Link href="/admin/finance" className="font-bold text-amber-900">{finance.pending.length} →</Link></li>
            <li className="flex justify-between"><span>Open sponsorship invoices</span><Link href="/admin/exhibitors/sponsors" className="font-bold text-amber-900">{(store.sponsorshipInvoices ?? []).filter((i) => i.status !== "paid").length} →</Link></li>
            <li className="flex justify-between"><span>Speaker applications</span><Link href="/admin/abstracts" className="font-bold text-amber-900">{pendingApps} →</Link></li>
            <li className="flex justify-between"><span>Exhibitor applications</span><Link href="/admin/exhibitors/exhibitor-applications" className="font-bold text-amber-900">{exhibitorAppStats?.pending ?? 0} →</Link></li>
            <li className="flex justify-between"><span>Sponsorship applications</span><Link href="/admin/exhibitors/sponsorship-applications" className="font-bold text-amber-900">{sponsorshipAppStats?.pending ?? 0} →</Link></li>
            <li className="flex justify-between"><span>Media accreditation</span><Link href="/admin/media" className="font-bold text-amber-900">{mediaStats.data?.pending ?? 0} →</Link></li>
            <li className="flex justify-between"><span>Abstracts under review</span><Link href="/admin/abstracts" className="font-bold text-amber-900">{reviewAbs} →</Link></li>
          </ul>
          <Button asChild className="w-full mt-4 gradient-blue text-accent-foreground" size="sm"><Link href="/admin/checkin"><ScanLine className="h-3.5 w-3.5 mr-1" /> Open check-in</Link></Button>
        </div>
      </div>
    </div>
  );
}
