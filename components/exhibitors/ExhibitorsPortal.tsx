"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { SponsorshipRecordsList } from "@/components/admin/SponsorshipRecordsList";
import { ExhibitorApplicationsAdmin } from "@/components/admin/ExhibitorApplicationsAdmin";
import { SponsorshipApplicationsAdmin } from "@/components/admin/SponsorshipApplicationsAdmin";
import { BoothMapManager } from "@/components/admin/BoothMapManager";
import { ExhibitorPackagesPanel } from "@/components/admin/ExhibitorPackagesPanel";
import { SponsorshipTierEditor } from "@/components/admin/SponsorshipTierEditor";
import { ExhibitorsDirectoryPanel } from "@/components/exhibitors/ExhibitorsDirectoryPanel";
import {
  TAB_LABELS,
  isSponsorParticipation,
  type ExhibitorPortalTab,
} from "@/components/exhibitors/exhibitor-portal-config";
import type { ApplyParticipationType } from "@/lib/exhibitor-sponsor-apply";
import { CreateOrganizationDialog } from "@/components/exhibitors/CreateOrganizationDialog";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { useSearchParams } from "next/navigation";
import {
  useExhibitorApplicationStats,
  useSponsorshipApplicationStats,
} from "@/hooks/api/useExhibitor";
import { useSymposiumId } from "@/hooks/api/useSymposium";

type Props = {
  basePath: "/admin/exhibitors" | "/desk/exhibitors";
  activeTab: ExhibitorPortalTab;
  onTabChange: (tab: ExhibitorPortalTab) => void;
  /** Admin sees tier editor + booth map; desk is read-only directory */
  variant: "admin" | "desk";
  tabIds: readonly ExhibitorPortalTab[];
};

export function ExhibitorsPortal({ basePath, activeTab, onTabChange, variant, tabIds }: Props) {
  const store = useStore();
  const isAdmin = variant === "admin";
  const symposiumId = useSymposiumId();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState<ApplyParticipationType>("exhibitor");
  const [exhibitorTotal, setExhibitorTotal] = useState(0);
  const actorLabel = isAdmin ? "Admin" : "Registration desk";

  const { stats: exhibitorAppStats } = useExhibitorApplicationStats(isAdmin ? symposiumId || undefined : undefined);
  const { data: sponsorshipAppStats } = useSponsorshipApplicationStats(isAdmin ? symposiumId || undefined : undefined);
  const pendingExhibitorApps = exhibitorAppStats?.pending ?? 0;
  const pendingSponsorshipApps = sponsorshipAppStats?.pending ?? 0;

  const openCreateDialog = (role?: ApplyParticipationType) => {
    const fromUrl = searchParams.get("role");
    const resolved =
      role ?? (fromUrl === "exhibitor" || fromUrl === "sponsor" ? fromUrl : "exhibitor");
    setCreateRole(resolved);
    setCreateOpen(true);
  };

  const sponsorOrgs = store.approvedOrganizations.filter((o) => isSponsorParticipation(o.participation));

  useAdminCommandAction({
    "add-organization": () => openCreateDialog(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Exhibitors & sponsors</h1>
          <p className="text-muted-foreground">
            {exhibitorTotal} exhibitors
            {isAdmin && (
              <>
                {" "}
                · {pendingExhibitorApps} pending exhibitor · {pendingSponsorshipApps} pending sponsorship applications
              </>
            )}
            {!isAdmin && ` · ${sponsorOrgs.length} sponsors · Sponsorship invoices issued by Admin`}
          </p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => openCreateDialog()}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add organization
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ExhibitorPortalTab)}>
        <TabsList className="flex-wrap h-auto gap-1">
          {tabIds.map((id) => (
            <TabsTrigger key={id} value={id}>
              {TAB_LABELS[id]}
              {id === "exhibitor-applications" && pendingExhibitorApps > 0 && (
                <span className="ml-1.5 text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
                  {pendingExhibitorApps}
                </span>
              )}
              {id === "sponsorship-applications" && pendingSponsorshipApps > 0 && (
                <span className="ml-1.5 text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
                  {pendingSponsorshipApps}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="exhibitors" className="mt-6">
          <ExhibitorsDirectoryPanel onTotalChange={setExhibitorTotal} />
        </TabsContent>

        <TabsContent value="sponsors" className="mt-6">
          <SponsorshipRecordsList actorName={actorLabel} readOnly={!isAdmin} basePath={basePath} />
        </TabsContent>

        <TabsContent value="sponsorship-applications" className="mt-6">
          {isAdmin ? (
            <SponsorshipApplicationsAdmin />
          ) : (
            <p className="text-sm text-muted-foreground">Sponsorship applications management is admin-only.</p>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="exhibitor-applications" className="mt-6">
            <ExhibitorApplicationsAdmin />
          </TabsContent>
        )}

        {isAdmin && (
          <>
            <TabsContent value="packages" className="mt-6">
              <ExhibitorPackagesPanel />
            </TabsContent>
            <TabsContent value="tiers" className="mt-6">
              <SponsorshipTierEditor />
            </TabsContent>
            <TabsContent value="map" className="mt-6">
              <BoothMapManager />
            </TabsContent>
          </>
        )}

        <TabsContent value="analytics" className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border p-5 text-center">
            <div className="font-serif text-3xl font-bold">
              {store.approvedOrganizations.reduce((n, o) => n + o.profileViews, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total profile views</div>
          </div>
          <div className="rounded-2xl bg-card border p-5 text-center">
            <div className="font-serif text-3xl font-bold">
              {store.approvedOrganizations.reduce((n, o) => n + o.brochureDownloads, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Brochure downloads</div>
          </div>
          <div className="rounded-2xl bg-card border p-5 text-center">
            <div className="font-serif text-3xl font-bold">
              {store.approvedOrganizations.reduce((n, o) => n + o.leads, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Leads captured</div>
          </div>
        </TabsContent>
      </Tabs>

      <CreateOrganizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultParticipation={createRole}
        actorLabel={actorLabel}
      />
    </div>
  );
}
