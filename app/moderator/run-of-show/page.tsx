"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSessionsPanel, ProgrammeDayFilter, type SessionDayFilter } from "@/components/admin/AdminSessionsPanel";
import { RunOfShowPanel, type RunOfShowDayFilter } from "@/components/programme/RunOfShowPanel";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission, PERMISSIONS } from "@/lib/auth/roles";
import { releaseStuckRadixLayerLocks } from "@/lib/radix-layer-fix";

type ModeratorProgrammeTab = "sessions" | "run-of-show";

export default function ModeratorRunOfShowPage() {
  const [activeTab, setActiveTab] = useState<ModeratorProgrammeTab>("run-of-show");
  const [dayFilter, setDayFilter] = useState<SessionDayFilter>("all");
  const { permissions, ready } = useAuth();
  const canManageSessions = hasPermission(permissions, PERMISSIONS.SESSIONS_MANAGE);

  useEffect(() => {
    releaseStuckRadixLayerLocks();
  }, [activeTab]);

  const rosDayFilter: RunOfShowDayFilter = dayFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Programme & run of show</h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage sessions and the live timeline — same data as Admin → Programme, tuned for event-day moderation.
          </p>
        </div>
        <ProgrammeDayFilter value={dayFilter} onChange={setDayFilter} />
      </div>

    

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as ModeratorProgrammeTab);
          releaseStuckRadixLayerLocks();
        }}
      >
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="run-of-show">Run of show</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-6 focus-visible:outline-none">
          {activeTab === "sessions" ? <AdminSessionsPanel dayFilter={dayFilter} /> : null}
        </TabsContent>

        <TabsContent value="run-of-show" className="mt-6 focus-visible:outline-none">
          {activeTab === "run-of-show" ? (
            <RunOfShowPanel
              dayFilter={rosDayFilter}
              onDayFilterChange={(d) => setDayFilter(d)}
              showDayFilter={false}
              dataSource="api"
              showGoLive
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
