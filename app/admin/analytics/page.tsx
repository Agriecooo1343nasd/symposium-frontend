"use client";

import { StatTile } from "@/components/layout/PortalShell";
import {
  useAnalyticsDashboard,
  useAttendanceHeatmap,
  useRegistrationsTrend,
  useRevenueByPeriod,
  useTicketDistribution,
} from "@/hooks/api/useEngage";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Page() {
  const { dashboard, isLoading } = useAnalyticsDashboard();
  const { points } = useRegistrationsTrend("day");
  const { items: distribution } = useTicketDistribution();
  const { items: revenue } = useRevenueByPeriod("month");
  const { cells } = useAttendanceHeatmap();

  const maxCategory = Math.max(...distribution.map((d) => d.count), 1);
  const maxTrend = Math.max(...points.map((p) => p.count), 1);
  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);
  const maxCheckIn = Math.max(...cells.map((c) => c.checkInCount), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Live counts on registrations, revenue, and audience mix.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Registrations"
          value={isLoading ? "…" : (dashboard?.registrationsCount ?? 0)}
          accent
        />
        <StatTile
          label="Revenue"
          value={isLoading ? "…" : `$${(dashboard?.revenueSum ?? 0).toLocaleString()}`}
        />
        <StatTile label="Submissions" value={isLoading ? "…" : (dashboard?.submissionsCount ?? 0)} />
        <StatTile label="Speakers" value={isLoading ? "…" : (dashboard?.speakersCount ?? 0)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Registrations by ticket category</h2>
          {distribution.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {distribution.map((c) => (
                <div key={c.categoryId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.categoryName}</span>
                    <span className="font-mono text-xs">{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full gradient-blue"
                      style={{ width: `${(c.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Registrations trend (daily)</h2>
          {points.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trend data yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {points.slice(-30).map((p) => (
                <div key={p.period} className="flex-1 flex flex-col justify-end" title={`${p.period}: ${p.count}`}>
                  <div
                    className="gradient-blue rounded-t"
                    style={{ height: `${(p.count / maxTrend) * 100}%`, minHeight: p.count > 0 ? 2 : 0 }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Revenue by month</h2>
          {revenue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed payments yet.</p>
          ) : (
            <div className="space-y-3">
              {revenue.map((r) => (
                <div key={r.period}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{r.period}</span>
                    <span className="font-mono text-xs">
                      ${r.revenue.toLocaleString()} · {r.transactionCount} txns
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full gradient-blue"
                      style={{ width: `${(r.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="font-serif font-bold mb-4">Check-in heatmap</h2>
          {cells.length === 0 ? (
            <p className="text-sm text-muted-foreground">No check-ins recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {DAY_LABELS.map((label, day) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-8 text-xs text-muted-foreground">{label}</span>
                  <div className="flex gap-0.5 flex-1">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const cell = cells.find((c) => c.dayOfWeek === day && c.hourOfDay === hour);
                      const count = cell?.checkInCount ?? 0;
                      return (
                        <div
                          key={hour}
                          className="h-3 flex-1 rounded-sm"
                          title={`${label} ${hour}:00 — ${count}`}
                          style={{
                            backgroundColor:
                              count > 0
                                ? `rgba(37, 99, 235, ${0.2 + (count / maxCheckIn) * 0.8})`
                                : "var(--secondary)",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
