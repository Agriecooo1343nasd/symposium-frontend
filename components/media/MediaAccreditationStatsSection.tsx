"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatTile } from "@/components/layout/PortalShell";
import type { MediaAccreditationDto, MediaAccreditationStatsDto } from "@/lib/api/dto";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#d97706", "#16a34a", "#dc2626", "#64748b"];
const STORAGE_KEY = "nas_media_stats_expanded";

type Props = {
  accreditations: MediaAccreditationDto[];
  stats?: MediaAccreditationStatsDto | null;
  storageKey?: string;
};

function readExpanded(key: string): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(key);
  if (stored === null) return true;
  return stored === "1";
}

export function MediaAccreditationStatsSection({
  accreditations,
  stats,
  storageKey = STORAGE_KEY,
}: Props) {
  const [open, setOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOpen(readExpanded(storageKey));
    setHydrated(true);
  }, [storageKey]);

  const pending = accreditations.filter((a) => a.status === "pending");
  const approved = accreditations.filter((a) => a.status === "approved");
  const rejected = accreditations.filter((a) => a.status === "rejected");
  const revoked = accreditations.filter((a) => a.status === "revoked");

  const counts = {
    pending: stats?.pending ?? pending.length,
    approved: stats?.verified ?? approved.length,
    rejected: stats?.rejected ?? rejected.length,
    revoked: revoked.length,
    total: stats?.total ?? accreditations.length,
  };

  const chartData = useMemo(
    () =>
      [
        { name: "Pending", value: counts.pending },
        { name: "Approved", value: counts.approved },
        { name: "Rejected", value: counts.rejected },
        { name: "Revoked", value: counts.revoked },
      ].filter((d) => d.value > 0),
    [counts.pending, counts.approved, counts.rejected, counts.revoked],
  );

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, next ? "1" : "0");
    }
  };

  if (!hydrated) {
    return (
      <div className="rounded-xl border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          Overview & statistics
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="rounded-xl border bg-card/50 overflow-hidden">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-expanded={open}
        >
          <BarChart3 className="h-4 w-4 text-accent shrink-0" />
          <span className="font-medium">Overview & statistics</span>
          {!open && (
            <span className="hidden sm:inline text-xs text-muted-foreground font-normal truncate">
              {counts.pending} pending · {counts.approved} approved · {counts.total} total
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
            {open ? "Hide" : "Show"}
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="p-4 pt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatTile label="Pending review" value={counts.pending} accent />
            <StatTile label="Approved" value={counts.approved} />
            <StatTile label="Rejected" value={counts.rejected} />
            <StatTile label="Revoked" value={counts.revoked} />
            <StatTile label="Total" value={counts.total} />
          </div>

          {chartData.length > 0 && (
            <div className="rounded-xl border bg-background p-4">
              <h2 className="font-serif font-bold text-sm mb-3">Status breakdown</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
