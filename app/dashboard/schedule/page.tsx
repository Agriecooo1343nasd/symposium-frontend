"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SessionCard } from "@/components/SessionCard";
import { SessionRatingPanel } from "@/components/session/SessionRatingPanel";
import { SESSIONS } from "@/lib/mock-data";
import { isSessionEnded } from "@/lib/session-ratings";
import { toast } from "sonner";

export default function DashboardSchedulePage() {
  const [saved, setSaved] = useState<string[]>(SESSIONS.slice(0, 4).map((s) => s.id));
  const list = SESSIONS.filter((s) => saved.includes(s.id));
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">My schedule</h1>
      <p className="text-muted-foreground mb-6">{list.length} sessions saved. Add more from the programme page.</p>
      <Tabs defaultValue="1">
        <TabsList className="grid grid-cols-2 max-w-sm mb-6">
          <TabsTrigger value="1">Day 1</TabsTrigger>
          <TabsTrigger value="2">Day 2</TabsTrigger>
        </TabsList>
        {([1, 2] as const).map((d) => (
          <TabsContent key={d} value={String(d)}>
            <div className="grid md:grid-cols-2 gap-4">
              {list.filter((s) => s.day === d).map((s) => (
                <div key={s.id} className="space-y-3">
                  <SessionCard
                    session={s}
                    onSave={() => {
                      setSaved(saved.filter((id) => id !== s.id));
                      toast.info("Removed from schedule");
                    }}
                  />
                  {isSessionEnded(s.id) && <SessionRatingPanel session={s} compact />}
                </div>
              ))}
              {list.filter((s) => s.day === d).length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground rounded-2xl bg-card border border-border border-dashed">
                  No sessions saved for this day yet.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
