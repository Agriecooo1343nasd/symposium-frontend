"use client";

import { useState } from "react";
import { RunOfShowPanel, type RunOfShowDayFilter } from "@/components/programme/RunOfShowPanel";
import { ProgrammeDayFilter, type SessionDayFilter } from "@/components/admin/AdminSessionsPanel";

export default function ModeratorRunOfShowPage() {
  const [dayFilter, setDayFilter] = useState<SessionDayFilter>("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Run of show</h1>
          <p className="text-muted-foreground max-w-2xl">
            Live programme timeline synced from Admin → Programme. Use this view during the event to follow session
            order, times, and linked programme details.
          </p>
        </div>
        <ProgrammeDayFilter value={dayFilter} onChange={setDayFilter} />
      </div>

      <RunOfShowPanel
        dayFilter={dayFilter as RunOfShowDayFilter}
        onDayFilterChange={(d) => setDayFilter(d)}
        showDayFilter={false}
        dataSource="api"
        readOnly
        showGoLive
      />
    </div>
  );
}
