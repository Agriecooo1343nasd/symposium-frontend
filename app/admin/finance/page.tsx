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
import { DAILY_REGS, EVENT } from "@/lib/mock-data";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { patchStore } from "@/lib/store";
import { getFinanceSummary } from "@/lib/finance-records";
import { useFinanceSummary, useFinanceTransactions, useConfirmManualPayment } from "@/hooks/api/useAdmin";
import { markInvoicePaid } from "@/lib/sponsorship-invoices";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { useAdminTabNavigation } from "@/hooks/use-admin-command-action";


const COLORS = ["hsl(var(--blue))", "hsl(var(--green))", "hsl(var(--gold))", "hsl(var(--navy))"];

export default function Page() {
  const store = useStore();
  const session = getSession();
  const financeTabs = ["overview", "transactions", "sponsorship", "bank", "reports", "settings"];
  const { activeTab, onTabChange } = useAdminTabNavigation(financeTabs, "overview");
  const financeSummary = useFinanceSummary();
  const { transactions: apiTransactions } = useFinanceTransactions({ limit: 100 });
  const confirmPayment = useConfirmManualPayment();
  const finance = getFinanceSummary();
  const grp = store.platformSettings.groupRegistration;
  const [tier59, setTier59] = useState(String(grp.tier5to9Percent));
  const [tier10, setTier10] = useState(String(grp.tier10PlusPercent));
  const [minGroup, setMinGroup] = useState(String(grp.minSize));
  const [, setTick] = useState(0);

  const { gross, refundedValue, pending, pendingValue, methodData, sponsorshipGross, registrationGross, items } = finance;
  const apiRevenue = financeSummary.data?.totalRevenue ?? 0;
  const apiPending = financeSummary.data?.pendingTransactions ?? 0;
  const revenueOverTime = DAILY_REGS.map((d) => ({ day: d.day.split(" ")[1], usd: d.regs * 95 }));
  const catRevenue = [
    { name: "Delegates", usd: registrationGross },
    { name: "Sponsors", usd: sponsorshipGross },
  ];
  const bankPending = apiTransactions.filter(
    (t) => String(t.method).toLowerCase().includes("bank") && t.status !== "completed" && t.status !== "paid",
  );

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-3xl font-bold">Finance</h1><p className="text-muted-foreground">Revenue, transactions, refunds and reconciliation.</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total revenue (API)" value={`$${apiRevenue.toLocaleString()}`} hint={`${financeSummary.data?.completedTransactions ?? 0} completed`} accent />
        <StatTile label="Net (mock ledger)" value={`$${(gross - refundedValue).toLocaleString()}`} />
        <StatTile label="Sponsorship (mock)" value={`$${sponsorshipGross.toLocaleString()}`} hint="Local invoices" />
        <StatTile label="Pending (API)" value={String(apiPending)} hint="Open transactions" />
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">API payments ({apiTransactions.length})</TabsTrigger>
          <TabsTrigger value="sponsorship">Sponsorship invoices</TabsTrigger>
          <TabsTrigger value="bank">Bank transfers ({bankPending.length})</TabsTrigger>
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
          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Payer</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Method</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Ref</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {apiTransactions.map((t) => (
                  <tr key={t.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.attendeeName}</div>
                      <div className="text-xs text-muted-foreground">{t.attendeeEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{t.ticketCategoryName ?? "Registration"}</td>
                    <td className="px-4 py-3 hidden md:table-cell capitalize">{t.method}</td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-muted-foreground">{t.externalTransId ?? t.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-right font-mono">{t.amount} {t.currency}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary">{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="sponsorship" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Proforma invoices from approved sponsorship applications — same records shown on exhibitor sponsorship pages.
          </p>
          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Reference</th>
                  <th className="text-left px-4 py-3">Organization</th>
                  <th className="text-right px-4 py-3">USD</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(store.sponsorshipInvoices ?? []).map((inv) => (
                  <tr key={inv.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{inv.reference}</td>
                    <td className="px-4 py-3">{inv.orgName}</td>
                    <td className="px-4 py-3 text-right font-mono">${inv.amountUsd.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs uppercase font-bold">{inv.status}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {inv.orgId && (
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/exhibitors/sponsorship/${inv.orgId}`}>Record</Link>
                        </Button>
                      )}
                      {inv.status !== "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markInvoicePaid(inv.id, session?.name ?? "Admin");
                            toast.success("Sponsorship payment recorded");
                            setTick((n) => n + 1);
                          }}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Mark paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-3 mt-6">
          {bankPending.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">All bank transfers confirmed ✓</p>
          ) : bankPending.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card border border-border p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-serif font-bold">{t.attendeeName}</div>
                <div className="text-xs text-muted-foreground">
                  {t.attendeeEmail} · {t.amount} {t.currency} · {t.status}
                </div>
              </div>
              <Button
                size="sm"
                className="gradient-blue text-accent-foreground"
                disabled={confirmPayment.isPending}
                onClick={() =>
                  confirmPayment.mutate(
                    { id: t.id, dto: { notes: "Confirmed from admin finance" } },
                    {
                      onSuccess: () => toast.success("Payment confirmed"),
                      onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
                    },
                  )
                }
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Confirm manual
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
              <div><Label>Group discount {minGroup}–9 (%)</Label><Input type="number" value={tier59} onChange={(e) => setTier59(e.target.value)} className="mt-1" /></div>
              <div><Label>Group discount 10+ (%)</Label><Input type="number" value={tier10} onChange={(e) => setTier10(e.target.value)} className="mt-1" /></div>
              <div><Label>Minimum group size</Label><Input type="number" value={minGroup} onChange={(e) => setMinGroup(e.target.value)} className="mt-1" /></div>
            </div>
            <Button
              className="gradient-blue text-accent-foreground"
              onClick={() => {
                patchStore((s) => ({
                  ...s,
                  platformSettings: {
                    ...s.platformSettings,
                    groupRegistration: {
                      ...s.platformSettings.groupRegistration,
                      minSize: Number(minGroup) || 5,
                      tier5to9Percent: Number(tier59) || 10,
                      tier10PlusPercent: Number(tier10) || 15,
                    },
                  },
                }));
                toast.success("Group registration settings saved");
              }}
            >
              Save changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
