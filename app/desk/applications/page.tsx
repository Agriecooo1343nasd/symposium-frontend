"use client";

import Link from "next/link";
import { Eye, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { DeskSubmissionReviewList } from "@/components/desk/DeskSubmissionReview";
import { useAdminSubmissions } from "@/hooks/api/useDesk";
import { submissionReviewStatus } from "@/lib/api/mappers/desk";

export default function DeskApplicationsPage() {
  const store = useStore();
  const { submissions, isLoading, isError, error } = useAdminSubmissions({ limit: 100 });
  const pending = submissions.filter((s) => submissionReviewStatus(s.status) === "pending");
  const pendingOrgs = store.organizationApplications.filter((o) => o.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Speaker submissions</h1>
          <p className="text-muted-foreground">
            Review abstract submissions. Exhibitor apps remain local mock.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/desk/exhibitors/applications">
            <Store className="h-3.5 w-3.5 mr-1" />
            Exhibitor / sponsor ({pendingOrgs.length} pending)
          </Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading submissions…</p>}
      {isError && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 p-4">
          {error instanceof Error ? error.message : "Could not load submissions — desk role may lack SUBMISSIONS_MANAGE / REVIEWS_MANAGE."}
        </p>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <DeskSubmissionReviewList submissions={pending} />
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-4">
          {submissions.map((app) => (
            <div key={app.id} className="rounded-md bg-card border border-border p-4 flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-medium">{app.title}</div>
                <div className="text-xs text-muted-foreground">
                  {app.presentationType} · {app.status.replace(/_/g, " ")}
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
