"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { usePagedList } from "@/hooks/use-paged-list";
import { getInvoicesForApplication } from "@/lib/sponsorship-invoices";
import { SponsorshipRecordsList } from "@/components/admin/SponsorshipRecordsList";
import { SponsorshipApplicationsAdmin } from "@/components/admin/SponsorshipApplicationsAdmin";
import type { OrganizationApplication, ParticipationType } from "@/lib/store";
import { BoothMapManager } from "@/components/admin/BoothMapManager";
import { SponsorshipTierEditor } from "@/components/admin/SponsorshipTierEditor";
import { ListToolbar } from "@/components/exhibitors/ListToolbar";
import { ExhibitorsDirectoryPanel } from "@/components/exhibitors/ExhibitorsDirectoryPanel";
import {
  TAB_LABELS,
  isSponsorParticipation,
  type ExhibitorPortalTab,
} from "@/components/exhibitors/exhibitor-portal-config";
import { cn } from "@/lib/utils";
import { CreateOrganizationDialog } from "@/components/exhibitors/CreateOrganizationDialog";
import { EditOrganizationDialog } from "@/components/exhibitors/EditOrganizationDialog";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { useSearchParams } from "next/navigation";

type Props = {
  basePath: "/admin/exhibitors" | "/desk/exhibitors";
  activeTab: ExhibitorPortalTab;
  onTabChange: (tab: ExhibitorPortalTab) => void;
  /** Admin sees tier editor + booth map; desk is read-only directory */
  variant: "admin" | "desk";
  tabIds: readonly ExhibitorPortalTab[];
};

function filterApp(a: OrganizationApplication, q: string) {
  return [a.companyName, a.contactEmail, a.contactName, a.participation, a.status, a.description].some((v) =>
    v?.toLowerCase().includes(q),
  );
}

function sortApp(a: OrganizationApplication, b: OrganizationApplication, key: string, dir: "asc" | "desc") {
  const mul = dir === "asc" ? 1 : -1;
  const cmp = (x: string | number, y: string | number) => (x < y ? -1 : x > y ? 1 : 0) * mul;
  switch (key) {
    case "status":
      return cmp(a.status, b.status);
    case "submitted":
      return cmp(a.submittedAt, b.submittedAt);
    case "participation":
      return cmp(a.participation, b.participation);
    default:
      return cmp(a.companyName.toLowerCase(), b.companyName.toLowerCase());
  }
}

export function ExhibitorsPortal({ basePath, activeTab, onTabChange, variant, tabIds }: Props) {
  const store = useStore();
  const isAdmin = variant === "admin";
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState<ParticipationType>("exhibitor");
  const [editAppId, setEditAppId] = useState<string | null>(null);
  const [exhibitorTotal, setExhibitorTotal] = useState(0);
  const actorLabel = isAdmin ? "Admin" : "Registration desk";

  const openCreateDialog = (role?: ParticipationType) => {
    const fromUrl = searchParams.get("role");
    const resolved =
      role ?? (fromUrl === "exhibitor" || fromUrl === "sponsor" || fromUrl === "both" ? fromUrl : "exhibitor");
    setCreateRole(resolved);
    setCreateOpen(true);
  };

  const sponsorOrgs = store.approvedOrganizations.filter((o) => isSponsorParticipation(o.participation));

  const appsList = usePagedList({
    items: store.organizationApplications,
    pageSize: 10,
    filterFn: filterApp,
    sortFn: sortApp,
    initialSortKey: "companyName",
  });

  const appDetailPath = (id: string) => `${basePath}/application/${id}`;

  const pendingApps = store.organizationApplications.filter((a) => a.status === "pending").length;

  useAdminCommandAction({
    "add-organization": () => openCreateDialog(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Exhibitors & sponsors</h1>
          <p className="text-muted-foreground">
            {exhibitorTotal} exhibitors · {sponsorOrgs.length} sponsors (local) · {pendingApps} pending applications
            {variant === "desk" && " · Sponsorship invoices issued by Admin"}
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
              {id === "applications" && pendingApps > 0 && (
                <span className="ml-1.5 text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
                  {pendingApps}
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

        <TabsContent value="applications" className="mt-6">
          <ListToolbar
            query={appsList.query}
            onQueryChange={appsList.setQuery}
            searchPlaceholder="Search applications by company, contact, status…"
            sortKey={appsList.sortKey}
            sortDir={appsList.sortDir}
            onSortKeyChange={(k) => appsList.setSort(k, appsList.sortDir)}
            onSortDirChange={(d) => appsList.setSort(appsList.sortKey, d)}
            sortOptions={[
              { value: "companyName", label: "Company" },
              { value: "status", label: "Status" },
              { value: "submitted", label: "Submitted" },
              { value: "participation", label: "Type" },
            ]}
            page={appsList.page}
            totalPages={appsList.totalPages}
            total={appsList.total}
            pageSize={appsList.pageSize}
            onPageChange={appsList.setPage}
            onPageSizeChange={appsList.setPageSize}
          />
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Organization</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Invoice</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appsList.pageItems.map((a) => {
                  const inv = getInvoicesForApplication(a.id)[0];
                  return (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">{a.companyName}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{a.description}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs">{a.contactEmail}</td>
                      <td className="px-4 py-3 text-xs capitalize">
                        {a.participation}
                        {a.sponsorshipTier ? ` · ${a.sponsorshipTier}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                            a.status === "approved"
                              ? "bg-green/15 text-green"
                              : a.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800",
                          )}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono hidden lg:table-cell">
                        {inv ? (
                          <span className={inv.status === "paid" ? "text-green" : "text-amber-700"}>
                            {inv.reference} · {inv.status}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditAppId(a.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={appDetailPath(a.id)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {appsList.pageItems.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground text-center">No applications match your filters.</p>
            )}
          </div>
        </TabsContent>

        {isAdmin && (
          <>
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
      <EditOrganizationDialog applicationId={editAppId} open={!!editAppId} onOpenChange={(o) => !o && setEditAppId(null)} />
    </div>
  );
}
