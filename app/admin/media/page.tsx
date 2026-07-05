"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, List, Loader2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MediaAccreditationReviewList } from "@/components/media/MediaAccreditationReviewList";
import { MediaAccreditationStatsSection } from "@/components/media/MediaAccreditationStatsSection";
import {
  useMediaAccreditationStats,
  useMediaAccreditations,
} from "@/hooks/api/useMediaAccreditation";
import { useAdminTabNavigation, useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { downloadMediaAccreditationsCsv } from "@/lib/media-accreditation-export";
import { AddMediaPersonDialog } from "@/components/media/AddMediaPersonDialog";
import { toast } from "sonner";

const TABS = ["pending", "approved", "rejected", "revoked", "all"] as const;

export default function AdminMediaPage() {
  const { activeTab, onTabChange } = useAdminTabNavigation([...TABS], "pending");
  const { accreditations, isLoading, isError, error, refetch, isFetching } = useMediaAccreditations({ limit: 200 });
  const statsQuery = useMediaAccreditationStats();
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [addOpen, setAddOpen] = useState(false);

  useAdminCommandAction({ "add-media-person": () => setAddOpen(true) });

  const pending = accreditations.filter((a) => a.status === "pending");
  const approved = accreditations.filter((a) => a.status === "approved");
  const rejected = accreditations.filter((a) => a.status === "rejected");
  const revoked = accreditations.filter((a) => a.status === "revoked");

  const tabItems: Record<(typeof TABS)[number], typeof accreditations> = useMemo(
    () => ({
      pending,
      approved,
      rejected,
      revoked,
      all: accreditations,
    }),
    [pending, approved, rejected, revoked, accreditations],
  );

  const exportCsv = () => {
    const items = tabItems[activeTab as (typeof TABS)[number]] ?? accreditations;
    downloadMediaAccreditationsCsv(items, `media-${activeTab}.csv`);
    toast.success(`Exported ${items.length} application(s)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Media & press</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Review press accreditation applications. Approve, reject, or revoke complimentary media access for NAS 2026.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="gradient-blue text-accent-foreground" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add media person
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={isLoading || accreditations.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
            Refresh
          </Button>
        </div>
      </div>

      {!isLoading && !isError && (
        <MediaAccreditationStatsSection accreditations={accreditations} stats={statsQuery.data} storageKey="nas_admin_media_stats" />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading applications…
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 p-4">
          {error instanceof Error ? error.message : "Could not load media accreditations — admin role needs CMS_READ."}
        </p>
      )}

      {!isLoading && !isError && (
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
              <TabsTrigger value="revoked">Revoked ({revoked.length})</TabsTrigger>
              <TabsTrigger value="all">All ({accreditations.length})</TabsTrigger>
            </TabsList>
            <div className="inline-flex rounded-lg border p-0.5">
              <Button
                type="button"
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <MediaAccreditationReviewList
                accreditations={tabItems[tab]}
                detailBasePath="/admin/media"
                showSearch={tab === "all" || tabItems[tab].length > 4}
                viewMode={viewMode}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <AddMediaPersonDialog open={addOpen} onOpenChange={setAddOpen} addedBy="admin" />
    </div>
  );
}
