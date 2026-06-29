"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeskMediaAccreditationList } from "@/components/desk/DeskMediaAccreditationList";
import { useMediaAccreditations } from "@/hooks/api/useDesk";

export default function DeskMediaPage() {
  const { accreditations, isLoading, isError, error } = useMediaAccreditations({ limit: 100 });
  const pending = accreditations.filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Media accreditation</h1>
        <p className="text-muted-foreground">
          Press applications from `GET /cms/admin/media-accreditations`.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading applications…</p>}
      {isError && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 p-4">
          {error instanceof Error ? error.message : "Could not load media accreditations — desk role may lack CMS_READ."}
        </p>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All applications ({accreditations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          <DeskMediaAccreditationList accreditations={pending} detailBasePath="/desk/media" />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <DeskMediaAccreditationList accreditations={accreditations} detailBasePath="/desk/media" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
