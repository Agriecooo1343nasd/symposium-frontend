"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Send, Plus, Download, ScanLine, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/layout/PortalShell";
import { TRANSACTIONS, DAILY_REGS, CHECKINS } from "@/lib/mock-data";
import { useStore } from "@/hooks/use-store";
import { getEventConfig } from "@/lib/platform-settings";
import { AnnouncementDialog } from "@/components/admin/AnnouncementDialog";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";


const COLORS = ["hsl(var(--blue))", "hsl(var(--green))", "hsl(var(--gold))", "hsl(var(--navy))", "hsl(var(--blue-light))", "#e85d3a"];

export default function AdminOverview() {
  const store = useStore();
  const event = getEventConfig();
  const [annOpen, setAnnOpen] = useState(false);
  const [regOpen, setRegOpen] = useState(false);

  const regs = store.registrations;
  const paid = regs.filter((r) => r.status === "paid" || r.status === "comp");
  const pending = regs.filter((r) => r.status === "pending");
  const revenue = paid.reduce((a, b) => a + b.amountUsd, 0);
  const pendingValue = pending.reduce((a, b) => a + b.amountUsd, 0);
  const pendingApps = store.speakerApplications.filter((a) => a.status === "pending").length;
  const reviewAbs = store.speakerAbstracts.filter((a) => a.status === "under-review" || a.status === "submitted").length;

  const methodData = ["MoMo MTN", "Airtel Money", "Card", "Bank Transfer"].map((m) => ({
    name: m, value: TRANSACTIONS.filter((t) => t.method === m && t.status === "completed").reduce((a, b) => a + b.amountUsd, 0),
  }));
  const catData = store.ticketPlans.map((c) => ({
    name: c.name.split(" ")[0],
    value: regs.filter((r) => r.category === c.name).length || 0,
  }));
  const funnelData = DAILY_REGS.map((d) => ({ day: d.day.split(" ")[1], visits: d.regs * 8, regs: d.regs }));

  const exportCsv = () => {
    const header = "name,email,category,status,amount\n";
    const rows = regs.map((r) => `${r.name},${r.email},${r.category},${r.status},${r.amountUsd}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "registrations.csv";
    a.click();
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
                <div className="min-w-0"><div className="font-medium truncate">{r.name}</div><div className="text-xs text-muted-foreground truncate">{r.country}</div></div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${r.status === "paid" ? "bg-green/15 text-green" : r.status === "comp" ? "bg-blue/15 text-blue" : "bg-amber-100 text-amber-800"}`}>{r.status}</span>
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
            {TRANSACTIONS.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0"><div className="font-medium truncate">{t.attendee}</div><div className="text-xs text-muted-foreground">{t.method}</div></div>
                <div className="text-right"><div className="font-mono text-xs">${t.amountUsd}</div><div className={`text-[10px] uppercase font-bold ${t.status === "completed" ? "text-green" : t.status === "pending" ? "text-amber-700" : t.status === "refunded" ? "text-blue" : "text-red-700"}`}>{t.status}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4 text-amber-700" /><h2 className="font-serif font-bold text-amber-900">Needs your action</h2></div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Pending bank transfers</span><Link href="/admin/finance" className="font-bold text-amber-900">{pending.length} →</Link></li>
            <li className="flex justify-between"><span>Speaker applications</span><Link href="/admin/abstracts" className="font-bold text-amber-900">{pendingApps} →</Link></li>
            <li className="flex justify-between"><span>Exhibitor applications</span><Link href="/admin/exhibitors/applications" className="font-bold text-amber-900">{store.organizationApplications.filter((a) => a.status === "pending").length} →</Link></li>
            <li className="flex justify-between"><span>Abstracts under review</span><Link href="/admin/abstracts" className="font-bold text-amber-900">{reviewAbs} →</Link></li>
          </ul>
          <Button asChild className="w-full mt-4 gradient-blue text-accent-foreground" size="sm"><Link href="/admin/checkin"><ScanLine className="h-3.5 w-3.5 mr-1" /> Open check-in</Link></Button>
        </div>
      </div>
    </div>
  );
}
