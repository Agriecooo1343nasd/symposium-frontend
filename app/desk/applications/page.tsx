"use client";

import Link from "next/link";
import { Eye, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { SpeakerAppReviewList } from "@/components/desk/SpeakerAppReview";

export default function DeskApplicationsPage() {
  const store = useStore();
  const pendingSpeakers = store.speakerApplications.filter((s) => s.status === "pending").length;
  const pendingOrgs = store.organizationApplications.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Speaker applications</h1>
          <p className="text-muted-foreground">
            Review speaker requests. Exhibitor and sponsor applications live under Exhibitors & sponsors.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/desk/exhibitors/applications">
            <Store className="h-3.5 w-3.5 mr-1" />
            Exhibitor / sponsor ({pendingOrgs} pending)
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingSpeakers})</TabsTrigger>
          <TabsTrigger value="all">All speaker apps</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <SpeakerAppReviewList apps={store.speakerApplications.filter((a) => a.status === "pending")} />
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-4">
          {store.speakerApplications.map((app) => (
            <div key={app.id} className="rounded-md bg-card border border-border p-4 flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-medium">{app.name}</div>
                <div className="text-xs text-muted-foreground">
                  {app.title} · {app.status}
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/desk/applications/speaker/${app.id}`}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View full application
                </Link>
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
