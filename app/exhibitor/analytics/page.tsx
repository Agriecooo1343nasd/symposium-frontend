"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { StatTile } from "@/components/layout/PortalShell";
import { EXHIBITOR_DAILY_VIEWS, EXHIBITOR_BROCHURES } from "@/lib/mock-data";
import { useStore } from "@/hooks/use-store";
import { getExhibitorOrgId } from "@/lib/store";
import { getLeadAnalytics, exhibitorHasLeadCapture } from "@/lib/lead-capture";
import { Button } from "@/components/ui/button";


const COLORS = ["hsl(var(--blue))", "hsl(var(--green))", "hsl(var(--gold))", "hsl(var(--navy))", "hsl(var(--accent))"];

export default function Page() {
  const store = useStore();
  const orgId = getExhibitorOrgId();
  const hasLeads = exhibitorHasLeadCapture(orgId);
  const analytics = useMemo(() => getLeadAnalytics(orgId), [store.exhibitorLeads, orgId]);

  const interestPie = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of analytics.leads) {
      const themes = l.interests?.length ? l.interests : l.interest ? [l.interest] : ["Other"];
      for (const t of themes) {
        counts[t] = (counts[t] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.length > 18 ? `${name.slice(0, 16)}…` : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [analytics.leads]);

  const leadsByDay = analytics.byDay.length > 0 ? analytics.byDay : [{ day: "No scans yet", leads: 0 }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Performance analytics</h1>
        <p className="text-muted-foreground">Booth engagement and lead capture (FR-5.3).</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Profile views" value={257} accent trend="+22%" hint="booth directory" />
        <StatTile label="Brochure downloads" value={60} trend="+8%" />
        <StatTile label="Leads captured" value={analytics.total} trend={hasLeads ? `+${analytics.contacted} in CRM` : "—"} accent={hasLeads} />
        <StatTile label="Top interest" value={analytics.topInterest} hint="from scanned delegates" />
      </div>

      {!hasLeads && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Lead analytics require Gold or Platinum sponsorship.{" "}
          <Link href="/exhibitor/sponsorship" className="font-medium underline text-accent">
            View packages
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Profile views — last 7 days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={EXHIBITOR_DAILY_VIEWS}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--blue))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold">Leads by day</h2>
            {hasLeads && (
              <Button asChild variant="outline" size="sm">
                <Link href="/exhibitor/leads">Scan more</Link>
              </Button>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leadsByDay}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="leads" fill="hsl(var(--green))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Most active: {analytics.mostActiveDay}</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Downloads per brochure</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={EXHIBITOR_BROCHURES.map((b) => ({ name: b.name.split(" ").slice(0, 2).join(" "), n: b.downloads }))}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="n" fill="hsl(var(--gold))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Leads by sub-theme interest</h2>
          {interestPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={interestPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {interestPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-16 text-center">
              Scan attendee badges to populate interest breakdown.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-xl">
        <StatTile label="In pipeline" value={analytics.contacted} />
        <StatTile label="Converted" value={analytics.converted} />
        <StatTile label="New (no follow-up)" value={analytics.leads.filter((l) => l.status === "None").length} />
      </div>
    </div>
  );
}
