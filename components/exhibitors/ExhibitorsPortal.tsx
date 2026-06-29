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
import type { ApprovedOrganization, OrganizationApplication } from "@/lib/store";
import { AdminExhibitorsApiPanel } from "@/components/admin/AdminExhibitorsApiPanel";
import { BoothMapManager } from "@/components/admin/BoothMapManager";
import { SponsorshipTierEditor } from "@/components/admin/SponsorshipTierEditor";
import { ListToolbar } from "@/components/exhibitors/ListToolbar";
import {
  TAB_LABELS,
  tierColor,
  isExhibitorParticipation,
  isSponsorParticipation,
  type ExhibitorPortalTab,
} from "@/components/exhibitors/exhibitor-portal-config";
import { cn } from "@/lib/utils";
import { CreateOrganizationDialog } from "@/components/exhibitors/CreateOrganizationDialog";
import { EditOrganizationDialog } from "@/components/exhibitors/EditOrganizationDialog";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { useSearchParams } from "next/navigation";
import type { ParticipationType } from "@/lib/store";

type Props = {
  basePath: "/admin/exhibitors" | "/desk/exhibitors";
  activeTab: ExhibitorPortalTab;
  onTabChange: (tab: ExhibitorPortalTab) => void;
  /** Admin sees tier editor + booth map; desk is read-only directory */
  variant: "admin" | "desk";
  tabIds: readonly ExhibitorPortalTab[];
};

function filterOrg(o: ApprovedOrganization, q: string) {
  return [o.name, o.booth, o.category, o.contact, o.description, o.participation]
    .some((v) => v?.toLowerCase().includes(q));
}

function sortOrg(a: ApprovedOrganization, b: ApprovedOrganization, key: string, dir: "asc" | "desc") {
  const mul = dir === "asc" ? 1 : -1;
  const cmp = (x: string | number, y: string | number) => (x < y ? -1 : x > y ? 1 : 0) * mul;
  switch (key) {
    case "booth":
      return cmp(a.booth, b.booth);
    case "leads":
      return cmp(a.leads, b.leads);
    case "views":
      return cmp(a.profileViews, b.profileViews);
    case "participation":
      return cmp(a.participation, b.participation);
    default:
      return cmp(a.name.toLowerCase(), b.name.toLowerCase());
  }
}

function filterApp(a: OrganizationApplication, q: string) {
  return [a.companyName, a.contactEmail, a.contactName, a.participation, a.status, a.description]
    .some((v) => v?.toLowerCase().includes(q));
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

function OrgCard({ org, onEdit }: { org: ApprovedOrganization; onEdit?: () => void }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 hover-lift">
      <div className="flex items-start justify-between mb-2">
        <div className="h-10 w-10 rounded-lg gradient-navy text-white flex items-center justify-center font-serif font-bold shrink-0">
          {org.name[0]}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary capitalize">
            {org.participation}
          </span>
          {org.sponsorshipTier && (
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(org.sponsorshipTier)}`}>
              {org.sponsorshipTier}
            </span>
          )}
        </div>
      </div>
      <div className="font-serif font-bold">{org.name}</div>
      <div className="text-xs text-muted-foreground mt-1">{org.category}</div>
      <div className="text-xs text-muted-foreground mt-2">
        Booth <span className="font-mono font-medium text-foreground">{org.booth}</span> · {org.contact}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-3">
          <span>{org.leads} leads</span>
          <span>{org.profileViews} views</span>
          <span>{org.brochureDownloads} downloads</span>
        </div>
        {onEdit && (
          <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={onEdit}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        )}
      </div>
    </div>
  );
}

export function ExhibitorsPortal({ basePath, activeTab, onTabChange, variant, tabIds }: Props) {
  const store = useStore();
  const isAdmin = variant === "admin";
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState<ParticipationType>("exhibitor");
  const [editAppId, setEditAppId] = useState<string | null>(null);
  const actorLabel = isAdmin ? "Admin" : "Registration desk";

  const openCreateDialog = (role?: ParticipationType) => {
    const fromUrl = searchParams.get("role");
    const resolved =
      role ??
      (fromUrl === "exhibitor" || fromUrl === "sponsor" || fromUrl === "both" ? fromUrl : "exhibitor");
    setCreateRole(resolved);
    setCreateOpen(true);
  };

  const exhibitorOrgs = store.approvedOrganizations.filter((o) => isExhibitorParticipation(o.participation));
  const sponsorOrgs = store.approvedOrganizations.filter((o) => isSponsorParticipation(o.participation));

  const exhibitorList = usePagedList({
    items: exhibitorOrgs,
    pageSize: 9,
    filterFn: filterOrg,
    sortFn: sortOrg,
    initialSortKey: "name",
  });

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
            {exhibitorOrgs.length} exhibitors · {sponsorOrgs.length} sponsors · {pendingApps} pending applications
            {variant === "desk" && " · Sponsorship invoices issued by Admin"}
          </p>
        </div>
        <Button
          size="sm"
          className="gradient-blue text-accent-foreground"
          onClick={() => openCreateDialog()}
        >
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
          {isAdmin && <AdminExhibitorsApiPanel />}
          <p className="text-sm text-muted-foreground mb-4">
            Approved organizations with an exhibitor booth (local mock below).
          </p>
          <ListToolbar
            query={exhibitorList.query}
            onQueryChange={exhibitorList.setQuery}
            searchPlaceholder="Search exhibitors by name, booth, contact…"
            sortKey={exhibitorList.sortKey}
            sortDir={exhibitorList.sortDir}
            onSortKeyChange={(k) => exhibitorList.setSort(k, exhibitorList.sortDir)}
            onSortDirChange={(d) => exhibitorList.setSort(exhibitorList.sortKey, d)}
            sortOptions={[
              { value: "name", label: "Name" },
              { value: "booth", label: "Booth" },
              { value: "leads", label: "Leads" },
              { value: "views", label: "Profile views" },
              { value: "participation", label: "Package type" },
            ]}
            page={exhibitorList.page}
            totalPages={exhibitorList.totalPages}
            total={exhibitorList.total}
            pageSize={exhibitorList.pageSize}
            onPageChange={exhibitorList.setPage}
            onPageSizeChange={exhibitorList.setPageSize}
          />
          {exhibitorList.pageItems.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm">No exhibitors match your filters.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exhibitorList.pageItems.map((e) => (
                  <OrgCard key={e.id} org={e} onEdit={() => setEditAppId(e.applicationId)} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sponsors" className="mt-6">
          <SponsorshipRecordsList actorName={actorLabel} readOnly={!isAdmin} basePath={basePath} />
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
