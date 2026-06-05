"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreateSpeakerDialog } from "@/components/speakers/CreateSpeakerDialog";
import { EditSpeakerDialog } from "@/components/speakers/EditSpeakerDialog";
import { useStore } from "@/hooks/use-store";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const store = useStore();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "submissions" ? "submissions" : "list";
  const [open, setOpen] = useState(false);
  const [editEmail, setEditEmail] = useState<string | null>(null);

  useAdminCommandAction({
    "add-speaker": () => setOpen(true),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Speakers</h1>
          <p className="text-muted-foreground">{store.speakerProfiles.length} in directory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Email composer opened")}>
            <Send className="h-3.5 w-3.5 mr-1" /> Email all speakers
          </Button>
          <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add speaker
          </Button>
        </div>
      </div>

      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="list">Speakers</TabsTrigger>
          <TabsTrigger value="submissions">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.speakerProfiles.map((s) => {
            const sess = store.sessions.filter((x) => x.speakers.includes(s.id));
            const app = store.speakerApplications.find((a) => a.email === s.email);
            return (
              <div key={s.id} className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-start gap-3">
                  <img src={s.photo} alt={s.name} className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-serif font-bold text-sm truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.flag} {s.org}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
                  <span className="text-muted-foreground">
                    {sess.length} session{sess.length !== 1 && "s"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-green/15 text-green font-bold uppercase text-[10px]">
                    Confirmed
                  </span>
                </div>
                {app && (
                  <p className="text-[10px] text-muted-foreground mt-2 line-clamp-1">{app.title}</p>
                )}
                {s.email && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs w-full"
                    onClick={() => setEditEmail(s.email!)}
                  >
                    Edit onboarding
                  </Button>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            {store.speakerApplications.filter((a) => a.status === "pending").length} pending ·{" "}
            <Link href="/admin/abstracts" className="text-accent font-semibold hover:underline">
              Review in Speaker apps →
            </Link>
          </p>
        </TabsContent>
      </Tabs>

      <CreateSpeakerDialog open={open} onOpenChange={setOpen} actorLabel="Admin" />
      <EditSpeakerDialog email={editEmail} open={!!editEmail} onOpenChange={(o) => !o && setEditEmail(null)} />
    </div>
  );
}
