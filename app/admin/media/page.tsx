"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaAppReviewList } from "@/components/media/MediaAppReviewList";
import { useStore } from "@/hooks/use-store";

export default function AdminMediaPage() {
  const store = useStore();
  const pending = store.mediaApplications.filter((a) => a.status === "pending");
  const approved = store.mediaApplications.filter((a) => a.status === "approved");
  const rejected = store.mediaApplications.filter((a) => a.status === "rejected");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Media & press</h1>
        <p className="text-muted-foreground">
          Review complimentary press accreditation applications — credentials, outlet letters, and coverage plans.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Pending", n: pending.length },
          { label: "Approved", n: approved.length },
          { label: "Rejected", n: rejected.length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border p-4 text-center">
            <div className="font-serif text-2xl font-bold">{s.n}</div>
            <div className="text-xs uppercase text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          <MediaAppReviewList apps={pending} detailBasePath="/admin/media" />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <MediaAppReviewList apps={approved} detailBasePath="/admin/media" />
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          <MediaAppReviewList apps={rejected} detailBasePath="/admin/media" />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <MediaAppReviewList apps={store.mediaApplications} detailBasePath="/admin/media" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
