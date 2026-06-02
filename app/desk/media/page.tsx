"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaAppReviewList } from "@/components/media/MediaAppReviewList";
import { useStore } from "@/hooks/use-store";

export default function DeskMediaPage() {
  const store = useStore();
  const pending = store.mediaApplications.filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Media accreditation</h1>
        <p className="text-muted-foreground">
          Press register at no cost on the public site. Approve credentials before issuing comp media badges at
          check-in.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All applications</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          <MediaAppReviewList apps={pending} detailBasePath="/desk/media" />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <MediaAppReviewList apps={store.mediaApplications} detailBasePath="/desk/media" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
