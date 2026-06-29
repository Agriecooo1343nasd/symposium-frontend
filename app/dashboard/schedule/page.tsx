"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { useMySchedule, useRemoveFromSchedule } from "@/hooks/api/useDashboard";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api/client";

export default function DashboardSchedulePage() {
  const { sessions, isLoading } = useMySchedule();
  const removeFromSchedule = useRemoveFromSchedule();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (sessionId: string) => {
    try {
      setRemovingId(sessionId);
      await removeFromSchedule.mutateAsync(sessionId);
      toast.info("Removed from schedule");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">My schedule</h1>
      <p className="text-muted-foreground mb-6">
        {isLoading ? "Loading…" : `${sessions.length} session${sessions.length === 1 ? "" : "s"} saved.`}{" "}
        Add more from the{" "}
        <Link href="/programme" className="text-accent font-semibold hover:underline">
          programme
        </Link>
        .
      </p>
      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Loading your agenda…</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">Your personal agenda is empty.</p>
          <Button asChild className="gradient-blue text-accent-foreground">
            <Link href="/programme">Browse programme</Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="1">
          <TabsList className="grid grid-cols-2 max-w-sm mb-6">
            <TabsTrigger value="1">Day 1</TabsTrigger>
            <TabsTrigger value="2">Day 2</TabsTrigger>
          </TabsList>
          {([1, 2] as const).map((d) => (
            <TabsContent key={d} value={String(d)}>
              <div className="grid md:grid-cols-2 gap-4">
                {sessions
                  .filter((s) => s.day === d)
                  .map((s) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      saved
                      saveLabel="Remove"
                      unsaveLabel={removingId === s.id ? "Removing…" : "Remove"}
                      onSave={() => handleRemove(s.id)}
                    />
                  ))}
                {sessions.filter((s) => s.day === d).length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground rounded-2xl bg-card border border-border border-dashed">
                    No sessions saved for this day yet.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
