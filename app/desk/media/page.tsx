"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MediaAccreditationReviewList } from "@/components/media/MediaAccreditationReviewList";
import { MediaAccreditationStatsSection } from "@/components/media/MediaAccreditationStatsSection";
import { AddMediaPersonDialog } from "@/components/media/AddMediaPersonDialog";
import { useMediaAccreditations, useMediaAccreditationStats } from "@/hooks/api/useMediaAccreditation";

export default function DeskMediaPage() {
  const { accreditations, isLoading, isError, error, refetch, isFetching } = useMediaAccreditations({ limit: 200 });
  const statsQuery = useMediaAccreditationStats();
  const pending = accreditations.filter((a) => a.status === "pending");
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Media accreditation</h1>
          <p className="text-muted-foreground">
            Review applications or add a journalist manually when they arrive at the desk.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gradient-blue text-accent-foreground" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add media person
          </Button>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading applications…
        </div>
      )}
      {isError && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 p-4">
          {error instanceof Error ? error.message : "Could not load media accreditations — desk role may lack CMS_READ."}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <MediaAccreditationStatsSection
            accreditations={accreditations}
            stats={statsQuery.data}
            storageKey="nas_desk_media_stats"
          />
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="all">All applications ({accreditations.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-6">
              <MediaAccreditationReviewList accreditations={pending} detailBasePath="/desk/media" />
            </TabsContent>
            <TabsContent value="all" className="mt-6">
              <MediaAccreditationReviewList accreditations={accreditations} detailBasePath="/desk/media" showSearch />
            </TabsContent>
          </Tabs>
        </>
      )}

      <AddMediaPersonDialog open={addOpen} onOpenChange={setAddOpen} addedBy="desk" />
    </div>
  );
}
