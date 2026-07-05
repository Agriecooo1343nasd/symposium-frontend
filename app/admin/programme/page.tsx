"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { AdminSessionsPanel, ProgrammeDayFilter, type SessionDayFilter } from "@/components/admin/AdminSessionsPanel";
import { AdminRoomsPanel } from "@/components/admin/AdminRoomsPanel";
import { RunOfShowPanel, type RunOfShowDayFilter } from "@/components/programme/RunOfShowPanel";
import { getSessionRatingSummary } from "@/lib/session-ratings";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAdminCommandAction, useAdminTabNavigation } from "@/hooks/use-admin-command-action";

export default function AdminProgrammePage() {
  const store = useStore();
  const { activeTab, onTabChange } = useAdminTabNavigation(
    ["sessions", "run-of-show", "rooms", "ratings"],
    "sessions",
  );
  const [dayFilter, setDayFilter] = useState<SessionDayFilter>("all");

  useAdminCommandAction({
    "add-room": () => onTabChange("rooms"),
  });

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

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
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

        <TabsContent value="sessions" className="mt-6">
          <AdminSessionsPanel dayFilter={dayFilter} />
        </TabsContent>

        <TabsContent value="run-of-show" className="mt-6">
          <RunOfShowPanel dayFilter={rosDayFilter} onDayFilterChange={(d) => setDayFilter(d)} showDayFilter={false} />
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <AdminRoomsPanel />
        </TabsContent>

        <TabsContent value="ratings" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Attendee ratings after sessions end (1–5 stars + comments). Mark sessions done in run-of-show to open rating.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
