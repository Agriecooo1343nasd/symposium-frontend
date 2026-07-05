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
            Build the live timeline with full programme session detail (capacity, sub-themes, learning objectives,
            speakers). Control whether each session is public or subscribers-only on the programme.
          </p>
        </div>
        <ProgrammeDayFilter value={dayFilter} onChange={setDayFilter} />
      </div>

      <RunOfShowPanel
        dayFilter={dayFilter as RunOfShowDayFilter}
        onDayFilterChange={(d) => setDayFilter(d)}
        showDayFilter={false}
      />
    </div>
  );
}
