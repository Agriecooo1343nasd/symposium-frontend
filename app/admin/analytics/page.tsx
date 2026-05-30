"use client";

import { StatTile } from "@/components/layout/PortalShell";
import { REGISTRATIONS, TICKET_CATEGORIES } from "@/lib/mock-data";


export default function Page() {
  const byCategory: Record<string, number> = {};
  REGISTRATIONS.forEach((r) => { byCategory[r.category] = (byCategory[r.category] ?? 0) + 1; });
  const byCountry: Record<string, number> = {};
  REGISTRATIONS.forEach((r) => { byCountry[r.country] = (byCountry[r.country] ?? 0) + 1; });
  const max = Math.max(...Object.values(byCategory), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Live counts on registrations, revenue, and audience mix.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total registrations" value={REGISTRATIONS.length} accent />
        <StatTile label="Paid" value={REGISTRATIONS.filter((r) => r.status === "paid").length} />
        <StatTile label="Pending" value={REGISTRATIONS.filter((r) => r.status === "pending").length} />
        <StatTile label="Countries" value={Object.keys(byCountry).length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Registrations by category</h2>
          <div className="space-y-3">
            {TICKET_CATEGORIES.map((c) => {
              const n = byCategory[c.name] ?? 0;
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1"><span>{c.name}</span><span className="font-mono text-xs">{n}</span></div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full gradient-blue" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Top countries</h2>
          <div className="space-y-2">
            {Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
              <div key={c} className="flex justify-between text-sm">
                <span>{c}</span><span className="font-mono text-xs text-muted-foreground">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
