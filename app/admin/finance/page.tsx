"use client";

import { useState } from "react";
import { Download, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { StatTile } from "@/components/layout/PortalShell";
import { TRANSACTIONS, DAILY_REGS, REGISTRATIONS, EVENT, TICKET_CATEGORIES } from "@/lib/mock-data";
import { toast } from "sonner";


const COLORS = ["hsl(var(--blue))", "hsl(var(--green))", "hsl(var(--gold))", "hsl(var(--navy))"];

export default function Page() {
  const completed = TRANSACTIONS.filter((t) => t.status === "completed");
  const gross = completed.reduce((a, b) => a + b.amountUsd, 0);
  const refunded = TRANSACTIONS.filter((t) => t.status === "refunded").reduce((a, b) => a + b.amountUsd, 0);
  const pending = TRANSACTIONS.filter((t) => t.status === "pending");
  const pendingValue = pending.reduce((a, b) => a + b.amountUsd, 0);
  const revenueOverTime = DAILY_REGS.map((d) => ({ day: d.day.split(" ")[1], usd: d.regs * 95 }));
  const methodData = ["MoMo MTN", "Airtel Money", "Card", "Bank Transfer"].map((m) => ({
    name: m, value: completed.filter((t) => t.method === m).reduce((a, b) => a + b.amountUsd, 0),
  }));
  const catRevenue = TICKET_CATEGORIES.map((c) => ({ name: c.name.split(" ")[0], usd: REGISTRATIONS.filter((r) => r.category === c.name && r.status === "paid").reduce((a, b) => a + b.amountUsd, 0) }));

  const [bank, setBank] = useState(pending);

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-3xl font-bold">Finance</h1><p className="text-muted-foreground">Revenue, transactions, refunds and reconciliation.</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Gross revenue" value={`$${gross.toLocaleString()}`} hint={`RWF ${(gross * EVENT.exchangeRate).toLocaleString()}`} accent />
        <StatTile label="Net (after refunds)" value={`$${(gross - refunded).toLocaleString()}`} />
        <StatTile label="Refunds issued" value={`$${refunded.toLocaleString()}`} />
        <StatTile label="Pending bank transfers" value={`$${pendingValue.toLocaleString()}`} hint={`${pending.length} transactions`} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="bank">Bank transfers ({pending.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-serif font-bold mb-4">Revenue over time</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={revenueOverTime}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="usd" stroke="hsl(var(--blue))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-serif font-bold mb-4">Revenue by category</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={catRevenue}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="usd" fill="hsl(var(--green))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-serif font-bold mb-4">Payment method breakdown</h2>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={methodData} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {methodData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 text-sm">
                {methodData.map((m, i) => (
                  <div key={m.name} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />{m.name}</span><span className="font-mono">${m.value.toLocaleString()}</span></div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <div className="flex justify-end mb-3"><Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Export</Button></div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left px-4 py-3">Attendee</th><th className="text-left px-4 py-3 hidden md:table-cell">Method</th><th className="text-left px-4 py-3 hidden sm:table-cell">Ref</th><th className="text-right px-4 py-3">Amount</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3 hidden lg:table-cell">When</th></tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((t) => (
                  <tr key={t.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{t.attendee}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{t.method}</td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-muted-foreground">{t.ref}</td>
                    <td className="px-4 py-3 text-right font-mono">${t.amountUsd}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.status === "completed" ? "bg-green/15 text-green" : t.status === "pending" ? "bg-amber-100 text-amber-800" : t.status === "refunded" ? "bg-blue/15 text-blue" : "bg-red-100 text-red-700"}`}>{t.status}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{t.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-3 mt-6">
          {bank.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">All transfers confirmed ✓</p>
          ) : bank.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card border border-border p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-serif font-bold">{t.attendee}</div>
                <div className="text-xs text-muted-foreground">Proforma {t.ref} · ${t.amountUsd} · expected {t.at}</div>
              </div>
              <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => { setBank(bank.filter((x) => x.id !== t.id)); toast.success("Transfer confirmed; ticket emailed"); }}>
                <Check className="h-3.5 w-3.5 mr-1" /> Confirm payment
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="mt-6 space-y-4">
          <div className="rounded-2xl bg-card border border-border p-6 max-w-2xl">
            <h2 className="font-serif font-bold mb-4">Generate a report</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div><Label>From</Label><Input type="date" defaultValue="2026-04-01" className="mt-1" /></div>
              <div><Label>To</Label><Input type="date" defaultValue="2026-08-14" className="mt-1" /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {["Daily Revenue", "Reconciliation", "VAT"].map((r) => (
                <Button key={r} variant="outline" onClick={() => toast.success(`${r} report queued`)}><FileText className="h-3.5 w-3.5 mr-1" /> {r}</Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-4 max-w-2xl">
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-center justify-between"><div><Label>VAT enabled</Label><p className="text-xs text-muted-foreground">Apply VAT to all paid registrations.</p></div><Switch /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>VAT rate (%)</Label><Input defaultValue="18" className="mt-1" /></div>
              <div><Label>USD → RWF rate</Label><Input defaultValue={EVENT.exchangeRate} className="mt-1" /></div>
              <div><Label>Group discount 5-9</Label><Input defaultValue="10" className="mt-1" /></div>
              <div><Label>Group discount 10+</Label><Input defaultValue="15" className="mt-1" /></div>
            </div>
            <Button className="gradient-blue text-accent-foreground" onClick={() => toast.success("Saved")}>Save changes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
