"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Eye, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useListExhibitorApplications,
  useExhibitorApplicationStats,
  useApproveExhibitorApplication,
  useRejectExhibitorApplication,
  useAdminExhibitorPackages,
} from "@/hooks/api/useExhibitor";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { useBooths } from "@/hooks/api/useBooths";
import { usePagedList } from "@/hooks/use-paged-list";
import { ListToolbar } from "@/components/exhibitors/ListToolbar";
import { apiErrorMessage } from "@/lib/api/client";
import { exhibitorsService, usersService } from "@/lib/api/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ExhibitionBoothDto, ExhibitorApplicationDto, ExhibitorPackageDto } from "@/lib/api/dto";

export function ExhibitorApplicationsAdmin() {
  const symposiumId = useSymposiumId();
  const [selectedStatus, setSelectedStatus] = useState<"" | "pending" | "approved" | "rejected" | "invoiced">("pending");
  const { applications = [] } = useListExhibitorApplications(symposiumId || undefined, selectedStatus || undefined);
  const { stats } = useExhibitorApplicationStats(symposiumId || undefined);
  const { packages } = useAdminExhibitorPackages(symposiumId || undefined);
  const { booths } = useBooths(symposiumId);
  const approveMutation = useApproveExhibitorApplication();
  const rejectMutation = useRejectExhibitorApplication();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewApp, setViewApp] = useState<ExhibitorApplicationDto | null>(null);
  const [selectedApp, setSelectedApp] = useState<ExhibitorApplicationDto | null>(null);
  const [approveForm, setApproveForm] = useState({
    packageId: "",
    boothId: "",
    boothNumber: "",
    adminNotes: "",
  });
  const [rejectNotes, setRejectNotes] = useState("");

  const list = usePagedList({ items: applications, pageSize: 10 });

  const openView = (app: ExhibitorApplicationDto) => {
    setViewApp(app);
    setViewDialogOpen(true);
  };

  const openApprove = (app: ExhibitorApplicationDto) => {
    setSelectedApp(app);
    const booth = booths.find((b) => b.id === app.preferredBoothId);
    setApproveForm({
      packageId: app.packageId ?? packages[0]?.id ?? "",
      boothId: app.preferredBoothId ?? "",
      boothNumber: booth?.code ?? "",
      adminNotes: "",
    });
    setApproveDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    approveMutation.mutate(
      {
        id: selectedApp.id,
        dto: {
          packageId: approveForm.packageId || undefined,
          boothId: approveForm.boothId || undefined,
          boothNumber: approveForm.boothNumber || undefined,
          adminNotes: approveForm.adminNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Exhibitor application approved and invoice issued");
          setApproveDialogOpen(false);
          setSelectedApp(null);
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const handleReject = () => {
    if (!selectedApp) return;
    rejectMutation.mutate(
      { id: selectedApp.id, adminNotes: rejectNotes },
      {
        onSuccess: () => {
          toast.success("Application rejected");
          setRejectDialogOpen(false);
          setSelectedApp(null);
          setRejectNotes("");
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const packageName = (id?: string | null) => packages.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid sm:grid-cols-5 gap-4">
          {(
            [
              ["pending", stats.pending, "text-amber-600"],
              ["approved", stats.approved, "text-green"],
              ["rejected", stats.rejected, "text-red-600"],
              ["invoiced", stats.invoiced, "text-blue"],
              ["total", stats.total, "text-foreground"],
            ] as const
          ).map(([label, value, color]) => (
            <div key={label} className="rounded-2xl bg-card border p-4">
              <div className={cn("text-2xl font-bold", color)}>{value}</div>
              <div className="text-xs text-muted-foreground capitalize">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(["", "pending", "approved", "rejected", "invoiced"] as const).map((status) => (
          <Button
            key={status || "all"}
            variant={selectedStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(status)}
            className={status === "" ? "gradient-blue text-accent-foreground" : ""}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
          </Button>
        ))}
      </div>

      <ListToolbar
        query={list.query}
        onQueryChange={list.setQuery}
        searchPlaceholder="Search by company, email, package…"
        sortKey={list.sortKey}
        sortDir={list.sortDir}
        onSortKeyChange={(k) => list.setSort(k, list.sortDir)}
        onSortDirChange={(d) => list.setSort(list.sortKey, d)}
        sortOptions={[
          { value: "organizationName", label: "Company" },
          { value: "status", label: "Status" },
          { value: "createdAt", label: "Submitted" },
        ]}
        page={list.page}
        totalPages={list.totalPages}
        total={list.total}
        pageSize={list.pageSize}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
      />

      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Organization</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3">Package</th>
              <th className="text-left px-4 py-3">Staff</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.pageItems.map((app) => (
              <tr key={app.id} className="border-t hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{app.organizationName}</div>
                  {app.quotedFeeUsd != null ? (
                    <div className="text-xs text-muted-foreground">Est. ${Number(app.quotedFeeUsd).toLocaleString()}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs">
                  <div>{app.contactName}</div>
                  <div className="text-muted-foreground">{app.contactEmail}</div>
                </td>
                <td className="px-4 py-3 text-xs">{packageName(app.packageId)}</td>
                <td className="px-4 py-3 text-xs">{app.staffCount ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                      app.status === "approved" || app.status === "invoiced"
                        ? "bg-green/15 text-green"
                        : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => openView(app)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                  {app.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => openApprove(app)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedApp(app);
                          setRejectDialogOpen(true);
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1 text-red-600" /> Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.pageItems.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground text-center">
            {selectedStatus ? `No ${selectedStatus} exhibitor applications` : "No exhibitor applications"}
          </p>
        )}
      </div>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve exhibitor application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold">{selectedApp.organizationName}</div>
                <div className="text-xs text-muted-foreground">{selectedApp.contactEmail}</div>
              </div>
              <div>
                <Label>Booth package</Label>
                <Select
                  value={approveForm.packageId}
                  onValueChange={(v) => setApproveForm({ ...approveForm, packageId: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${Number(p.priceUsd).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign booth</Label>
                <Select
                  value={approveForm.boothId || "_none"}
                  onValueChange={(v) => {
                    const booth = booths.find((b) => b.id === v);
                    setApproveForm({
                      ...approveForm,
                      boothId: v === "_none" ? "" : v,
                      boothNumber: booth?.code ?? approveForm.boothNumber,
                    });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Preferred or pick booth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No map booth</SelectItem>
                    {booths
                      .filter((b) => b.status === "available" || b.id === selectedApp.preferredBoothId)
                      .map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.code} ({b.status})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Booth code</Label>
                <Input
                  value={approveForm.boothNumber}
                  onChange={(e) => setApproveForm({ ...approveForm, boothNumber: e.target.value })}
                  placeholder="e.g. A-12"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Admin notes</Label>
                <Textarea
                  value={approveForm.adminNotes}
                  onChange={(e) => setApproveForm({ ...approveForm, adminNotes: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={approveMutation.isPending}>
                  Cancel
                </Button>
                <Button className="gradient-blue text-accent-foreground" onClick={handleApprove} disabled={approveMutation.isPending}>
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Approving…
                    </>
                  ) : (
                    "Approve & invoice"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject exhibitor application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Reason for rejection (optional)…"
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={rejectMutation.isPending}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
                  Reject
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ViewApplicationDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        app={viewApp}
        packages={packages}
        booths={booths}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm border-b border-border/60 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function ViewApplicationDialog({
  open,
  onOpenChange,
  app,
  packages,
  booths,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: ExhibitorApplicationDto | null;
  packages: ExhibitorPackageDto[];
  booths: ExhibitionBoothDto[];
}) {
  const contactUserQuery = useQuery({
    queryKey: ["users", "detail", app?.contactUserId],
    queryFn: () => usersService.getById(app!.contactUserId!),
    enabled: open && Boolean(app?.contactUserId),
  });

  const exhibitorQuery = useQuery({
    queryKey: ["exhibitors", "admin", "detail", app?.exhibitorId],
    queryFn: () => exhibitorsService.getAdmin(app!.exhibitorId!),
    enabled: open && Boolean(app?.exhibitorId),
  });

  if (!app) return null;

  const pkg = packages.find((p) => p.id === app.packageId);
  const booth = booths.find((b) => b.id === app.preferredBoothId);
  const contactUser = contactUserQuery.data;
  const exhibitor = exhibitorQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{app.organizationName}</DialogTitle>
          <span
            className={cn(
              "inline-block w-fit text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
              app.status === "approved" || app.status === "invoiced"
                ? "bg-green/15 text-green"
                : app.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-800",
            )}
          >
            {app.status}
          </span>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Contact
            </h4>
            <div className="space-y-0">
              <DetailRow label="Name" value={app.contactName} />
              <DetailRow label="Email" value={app.contactEmail} />
              <DetailRow label="Phone" value={app.contactPhone} />
              <DetailRow
                label="Linked account"
                value={
                  !app.contactUserId
                    ? "Not linked yet"
                    : contactUserQuery.isLoading
                      ? "Loading…"
                      : contactUserQuery.isError
                        ? "Could not load user"
                        : contactUser
                          ? `${contactUser.firstName} ${contactUser.lastName}${
                              contactUser.roles?.length ? ` · ${contactUser.roles.join(", ")}` : ""
                            }`
                          : "—"
                }
              />
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Application
            </h4>
            <div className="space-y-0">
              <DetailRow label="Package requested" value={pkg?.name} />
              <DetailRow
                label="Quoted fee"
                value={app.quotedFeeUsd != null ? `$${Number(app.quotedFeeUsd).toLocaleString()}` : undefined}
              />
              <DetailRow label="Staff count" value={app.staffCount} />
              <DetailRow
                label="Preferred booth"
                value={booth ? `${booth.code} (${booth.status})` : app.preferredBoothId ? "Booth no longer on map" : "None"}
              />
              <DetailRow label="Submitted" value={new Date(app.createdAt).toLocaleString()} />
              <DetailRow label="Last updated" value={new Date(app.updatedAt).toLocaleString()} />
            </div>
          </section>

          {app.message && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Pitch / message
              </h4>
              <p className="text-sm rounded-lg bg-secondary/40 p-3 whitespace-pre-wrap">{app.message}</p>
            </section>
          )}

          {app.adminNotes && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Admin notes
              </h4>
              <p className="text-sm rounded-lg bg-secondary/40 p-3 whitespace-pre-wrap">{app.adminNotes}</p>
            </section>
          )}

          {app.exhibitorId && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Resulting exhibitor record
              </h4>
              <div className="space-y-0">
                {exhibitorQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground py-2">Loading exhibitor record…</p>
                ) : exhibitorQuery.isError ? (
                  <p className="text-sm text-muted-foreground py-2">Could not load exhibitor record.</p>
                ) : exhibitor ? (
                  <>
                    <DetailRow label="Booth assigned" value={exhibitor.boothNumber} />
                    <DetailRow label="Staff pass quota" value={exhibitor.staffPassQuota} />
                  </>
                ) : null}
              </div>
            </section>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
