"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PollTally } from "@/lib/live-polls";

export function PollResultsChart({ tally, totalVotes }: { tally: PollTally[]; totalVotes: number }) {
  const data = tally.map((t) => ({
    name: t.label.length > 28 ? `${t.label.slice(0, 26)}…` : t.label,
    fullName: t.label,
    votes: t.count,
    percent: t.percent,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{totalVotes} vote{totalVotes === 1 ? "" : "s"} recorded</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value, _name, item) => [
                `${value} (${(item.payload as { percent: number }).percent}%)`,
                "Votes",
              ]}
              labelFormatter={(_l, payload) => (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""}
            />
            <Bar dataKey="votes" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2">
        {tally.map((t) => (
          <li key={t.optionId} className="text-sm">
            <div className="flex justify-between gap-2 mb-1">
              <span className="font-medium">{t.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {t.count} ({t.percent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${t.percent}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
