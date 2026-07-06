"use client";

import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { AdminSessionsPanel, ProgrammeDayFilter, type SessionDayFilter } from "@/components/admin/AdminSessionsPanel";
import { AdminRoomsPanel } from "@/components/admin/AdminRoomsPanel";
import { RunOfShowPanel, type RunOfShowDayFilter } from "@/components/programme/RunOfShowPanel";
import { getSessionRatingSummary } from "@/lib/session-ratings";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAdminCommandAction, useAdminTabNavigation } from "@/hooks/use-admin-command-action";
import { releaseStuckRadixLayerLocks } from "@/lib/radix-layer-fix";

type ProgrammeTab = "sessions" | "run-of-show" | "rooms" | "ratings";

/** Mount panel children only when their tab is active (avoids hidden panels blocking clicks). */
function ProgrammeTabPanel({ tab, activeTab, children }: { tab: ProgrammeTab; activeTab: ProgrammeTab; children: React.ReactNode }) {
  return (
    <TabsContent value={tab} className="mt-6 focus-visible:outline-none">
      {activeTab === tab ? children : null}
    </TabsContent>
  );
}

export default function AdminProgrammePage() {
  const store = useStore();
  const { activeTab: urlTab, onTabChange } = useAdminTabNavigation(
    ["sessions", "run-of-show", "rooms", "ratings"],
    "sessions",
  );
  const [activeTab, setActiveTab] = useState<ProgrammeTab>(urlTab as ProgrammeTab);
  const [dayFilter, setDayFilter] = useState<SessionDayFilter>("all");

  useEffect(() => {
    setActiveTab(urlTab as ProgrammeTab);
  }, [urlTab]);

  useEffect(() => {
    releaseStuckRadixLayerLocks();
  }, []);

  useEffect(() => {
    releaseStuckRadixLayerLocks();
  }, [activeTab]);

  useAdminCommandAction({
    "add-room": () => handleTabChange("rooms"),
  });

  const handleTabChange = (tab: string) => {
    const next = tab as ProgrammeTab;
    setActiveTab(next);
    onTabChange(next);
    releaseStuckRadixLayerLocks();
  };

  const rosDayFilter: RunOfShowDayFilter = dayFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Programme builder</h1>
          <p className="text-muted-foreground">Sessions, run-of-show, and rooms — aligned with the moderator timeline</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("PDF export queued")}>
          <FileDown className="h-3.5 w-3.5 mr-1" /> Export PDF
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="relative">
        <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 bg-background pb-1">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="run-of-show">Run of show</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="ratings">Session ratings</TabsTrigger>
          </TabsList>

          {(activeTab === "sessions" || activeTab === "run-of-show") && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <ProgrammeDayFilter value={dayFilter} onChange={setDayFilter} />
            </div>
          )}
        </div>

        <ProgrammeTabPanel tab="sessions" activeTab={activeTab}>
          <AdminSessionsPanel dayFilter={dayFilter} />
        </ProgrammeTabPanel>

        <ProgrammeTabPanel tab="run-of-show" activeTab={activeTab}>
          <RunOfShowPanel
            dayFilter={rosDayFilter}
            onDayFilterChange={(d) => setDayFilter(d)}
            showDayFilter={false}
            dataSource="api"
          />
        </ProgrammeTabPanel>

        <ProgrammeTabPanel tab="rooms" activeTab={activeTab}>
          <AdminRoomsPanel />
        </ProgrammeTabPanel>

        <ProgrammeTabPanel tab="ratings" activeTab={activeTab}>
          <p className="text-sm text-muted-foreground mb-4">
            Attendee ratings after sessions end (1–5 stars + comments). Mark sessions done in run-of-show to open
            rating.
          </p>
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Session</th>
                  <th className="text-left px-4 py-3">Avg</th>
                  <th className="text-left px-4 py-3">Count</th>
                  <th className="text-left px-4 py-3">Latest comments</th>
                </tr>
              </thead>
              <tbody>
                {store.sessions.map((s) => {
                  const summary = getSessionRatingSummary(s.id);
                  const comments = store.sessionRatings
                    .filter((r) => r.sessionId === s.id && r.comment)
                    .slice(-2)
                    .map((r) => r.comment);
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium line-clamp-1">{s.title}</div>
                        <div className="text-xs text-muted-foreground">Day {s.day}</div>
                      </td>
                      <td className="px-4 py-3">
                        {summary.count > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold">
                            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                            {summary.average}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">{summary.count}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[280px]">
                        {comments.length ? comments.join(" · ") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ProgrammeTabPanel>
      </Tabs>
    </div>
  );
}
