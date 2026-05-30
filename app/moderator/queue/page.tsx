"use client";

import { useState } from "react";
import { Check, X, Pin, MessageCircle, Users, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { patchStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ModeratorQueuePage() {
  const store = useStore();
  const [tab, setTab] = useState("pending");

  const updateStatus = (id: string, status: "approved" | "answered" | "dismissed", pinned?: boolean) => {
    patchStore((s) => ({
      ...s,
      remoteInteractions: s.remoteInteractions.map((i) =>
        i.id === id ? { ...i, status, ...(pinned !== undefined ? { pinned } : {}) } : i,
      ),
    }));
    toast.success("Updated");
  };

  const pending = store.remoteInteractions.filter((i) => i.status === "pending");
  const onScreen = store.remoteInteractions.filter((i) => i.status === "approved" || i.pinned);
  const answered = store.remoteInteractions.filter((i) => i.status === "answered");

  const Card = ({
    item,
    actions,
  }: {
    item: (typeof store.remoteInteractions)[0];
    actions?: boolean;
  }) => (
    <div className={cn("rounded-md border p-4", item.pinned ? "border-accent bg-accent/5" : "border-border bg-card")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">{item.type}</span>
            {item.location && <span className="text-[10px] text-muted-foreground">{item.location}</span>}
          </div>
          <div className="font-semibold">{item.author}</div>
          {item.authorEmail && <div className="text-xs text-muted-foreground">{item.authorEmail}</div>}
          <p className="text-sm mt-2">{item.message}</p>
          <div className="text-[10px] text-muted-foreground mt-2">{new Date(item.timestamp).toLocaleString()}</div>
        </div>
        {actions && item.status === "pending" && (
          <div className="flex flex-col gap-1 shrink-0">
            <Button
              size="sm"
              className="gradient-blue text-accent-foreground"
              onClick={() => updateStatus(item.id, "approved")}
              title="Show on screen"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "approved", true)} title="Pin">
              <Pin className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "answered")} title="Mark answered">
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => updateStatus(item.id, "dismissed")} title="Dismiss">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Remote audience queue</h1>
        <p className="text-muted-foreground">Questions, comments, and reactions from virtual and in-person attendees.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-md bg-card border border-border p-4 flex items-center gap-3">
          <Radio className="h-8 w-8 text-amber-600" />
          <div>
            <div className="font-serif text-2xl font-bold">{pending.length}</div>
            <div className="text-xs text-muted-foreground">Awaiting moderation</div>
          </div>
        </div>
        <div className="rounded-md bg-card border border-border p-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue" />
          <div>
            <div className="font-serif text-2xl font-bold">{onScreen.length}</div>
            <div className="text-xs text-muted-foreground">On screen now</div>
          </div>
        </div>
        <div className="rounded-md bg-card border border-border p-4 flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-green" />
          <div>
            <div className="font-serif text-2xl font-bold">{answered.length}</div>
            <div className="text-xs text-muted-foreground">Answered</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 min-h-[520px]">
        <div className="rounded-md border-2 border-accent/30 bg-accent/5 p-4 flex flex-col min-h-0">
          <h2 className="font-serif font-bold mb-3 flex items-center gap-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Live feed — on screen
          </h2>
          <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
            {onScreen.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Approve items from the queue to display here for the production team.
              </p>
            ) : (
              onScreen.map((i) => <Card key={i.id} item={i} />)
            )}
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
            <TabsList className="flex-wrap shrink-0">
              <TabsTrigger value="pending">Queue ({pending.length})</TabsTrigger>
              <TabsTrigger value="question">Questions</TabsTrigger>
              <TabsTrigger value="comment">Comments</TabsTrigger>
              <TabsTrigger value="reaction">Reactions</TabsTrigger>
              <TabsTrigger value="answered">Answered</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4 space-y-2 flex-1 overflow-y-auto min-h-0 max-h-[480px]">
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">Queue empty.</p>
              ) : (
                pending.map((i) => <Card key={i.id} item={i} actions />)
              )}
            </TabsContent>
            <TabsContent value="question" className="mt-4 space-y-2 flex-1 overflow-y-auto min-h-0 max-h-[480px]">
              {store.remoteInteractions
                .filter((i) => i.type === "question" && i.status === "pending")
                .map((i) => (
                  <Card key={i.id} item={i} actions />
                ))}
            </TabsContent>
            <TabsContent value="comment" className="mt-4 space-y-2 flex-1 overflow-y-auto min-h-0 max-h-[480px]">
              {store.remoteInteractions
                .filter((i) => i.type === "comment" && i.status === "pending")
                .map((i) => (
                  <Card key={i.id} item={i} actions />
                ))}
            </TabsContent>
            <TabsContent value="reaction" className="mt-4 space-y-2 flex-1 overflow-y-auto min-h-0 max-h-[480px]">
              {store.remoteInteractions
                .filter((i) => i.type === "reaction" && i.status === "pending")
                .map((i) => (
                  <Card key={i.id} item={i} actions />
                ))}
            </TabsContent>
            <TabsContent value="answered" className="mt-4 space-y-2 flex-1 overflow-y-auto min-h-0 max-h-[480px]">
              {answered.map((i) => (
                <Card key={i.id} item={i} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
