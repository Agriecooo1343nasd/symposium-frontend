"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreateSpeakerDialog } from "@/components/speakers/CreateSpeakerDialog";
import { EditSpeakerDialog } from "@/components/speakers/EditSpeakerDialog";
import { useStore } from "@/hooks/use-store";

export default function DeskSpeakersPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editEmail, setEditEmail] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Speakers</h1>
          <p className="text-muted-foreground">
            Manually onboard speakers with full registration and application data — same as the attendee apply flow.
          </p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add speaker
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Directory ({store.speakerProfiles.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending applications ({store.speakerApplications.filter((a) => a.status === "pending").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.speakerProfiles.map((s) => (
            <div key={s.id} className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-start gap-3">
                <img src={s.photo} alt={s.name} className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="font-serif font-bold text-sm truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.flag} {s.org}
                  </div>
                  {s.email && <div className="text-xs text-muted-foreground truncate mt-0.5">{s.email}</div>}
                </div>
              </div>
              {s.email && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-7 text-xs w-full"
                  onClick={() => setEditEmail(s.email!)}
                >
                  Edit onboarding
                </Button>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <p className="text-sm text-muted-foreground">
            Review pending applications in{" "}
            <Link href="/desk/applications" className="text-accent font-semibold hover:underline">
              Applications
            </Link>
            .
          </p>
        </TabsContent>
      </Tabs>

      <CreateSpeakerDialog open={open} onOpenChange={setOpen} actorLabel="Registration desk" />
      <EditSpeakerDialog email={editEmail} open={!!editEmail} onOpenChange={(o) => !o && setEditEmail(null)} />
    </div>
  );
}
