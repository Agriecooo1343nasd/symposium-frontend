"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { SpeakerAppReviewList } from "@/components/desk/SpeakerAppReview";

export default function DeskApplicationsPage() {
  const store = useStore();
  const pendingOrgs = store.organizationApplications.filter((o) => o.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Speaker, exhibitor, and sponsor requests from paid delegates and organizations.
        </p>
      </div>

      <Tabs defaultValue="speakers">
        <TabsList>
          <TabsTrigger value="speakers">
            Speaker ({store.speakerApplications.filter((s) => s.status === "pending").length} pending)
          </TabsTrigger>
          <TabsTrigger value="exhibitors">Exhibitor / Sponsor ({pendingOrgs.length} pending)</TabsTrigger>
        </TabsList>

        <TabsContent value="speakers" className="mt-6 space-y-4">
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
          <SpeakerAppReviewList apps={store.speakerApplications.filter((a) => a.status === "pending")} />
        </TabsContent>

        <TabsContent value="exhibitors" className="mt-6 space-y-4">
          {pendingOrgs.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending organization applications.</p>
          )}
          {store.organizationApplications.map((app) => (
            <div key={app.id} className="rounded-md bg-card border border-border p-4 flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-medium">{app.companyName}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {app.participation}
                  {app.sponsorshipTier && ` · ${app.sponsorshipTier}`} · {app.status}
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/desk/applications/org/${app.id}`}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View details
                </Link>
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Final approval and booth assignment is completed by Admin → Exhibitors.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
