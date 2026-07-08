"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useListSponsorshipApplications,
  useSponsorshipApplicationStats,
  useApproveSponsorshipApplication,
  useRejectSponsorshipApplication,
} from "@/hooks/api/useExhibitor";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { useBooths } from "@/hooks/api/useBooths";
import { usePagedList } from "@/hooks/use-paged-list";
import { ListToolbar } from "@/components/exhibitors/ListToolbar";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SponsorshipApplicationsAdmin() {
  const symposiumId = useSymposiumId();
  const { booths } = useBooths(symposiumId);
  const [selectedStatus, setSelectedStatus] = useState<"" | "pending" | "approved" | "rejected">("pending");
  const { applications = [] } = useListSponsorshipApplications(symposiumId || undefined, selectedStatus || undefined);
  const { data: stats } = useSponsorshipApplicationStats(symposiumId || undefined);
  const approveMutation = useApproveSponsorshipApplication();
  const rejectMutation = useRejectSponsorshipApplication();
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState({
    tier: "",
    adminNotes: "",
    createExhibitorBooth: true,
    boothId: "",
    boothNumber: "",
    markInvoiced: true,
  });
  const [rejectNotes, setRejectNotes] = useState("");

  const list = usePagedList({
    items: applications,
    pageSize: 10,
  });

  const selectedApp = selectedAppId ? applications.find((a) => a.id === selectedAppId) : null;

  const handleApprove = () => {
    if (!selectedAppId) return;
    approveMutation.mutate(
      {
        id: selectedAppId,
        dto: {
          tier: approveForm.tier || undefined,
          adminNotes: approveForm.adminNotes || undefined,
          createExhibitorBooth: approveForm.createExhibitorBooth,
          boothId: approveForm.boothId || undefined,
          boothNumber: approveForm.boothNumber || undefined,
          markInvoiced: approveForm.markInvoiced,
        },
      },
      {
        onSuccess: () => {
          toast.success("Application approved and invoice issued");
          setApproveDialogOpen(false);
          setSelectedAppId(null);
          setApproveForm({ tier: "", adminNotes: "", createExhibitorBooth: true, boothId: "", boothNumber: "", markInvoiced: true });
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const handleReject = () => {
    if (!selectedAppId) return;
    rejectMutation.mutate(
      {
        id: selectedAppId,
        adminNotes: rejectNotes,
      },
      {
        onSuccess: () => {
          toast.success("Application rejected");
          setRejectDialogOpen(false);
          setSelectedAppId(null);
          setRejectNotes("");
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-card border p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="rounded-2xl bg-card border p-4">
            <div className="text-2xl font-bold text-green">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="rounded-2xl bg-card border p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
          <div className="rounded-2xl bg-card border p-4">
            <div className="text-2xl font-bold text-blue">{stats.invoiced}</div>
            <div className="text-xs text-muted-foreground">Invoiced</div>
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(["" , "pending", "approved", "rejected"] as const).map((status) => (
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

      {/* Toolbar & list */}
      <ListToolbar
        query={list.query}
        onQueryChange={list.setQuery}
        searchPlaceholder="Search by company name, email, tier…"
        sortKey={list.sortKey}
        sortDir={list.sortDir}
        onSortKeyChange={(k) => list.setSort(k, list.sortDir)}
        onSortDirChange={(d) => list.setSort(list.sortKey, d)}
        sortOptions={[
          { value: "companyName", label: "Company" },
          { value: "desiredTier", label: "Tier" },
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

      {/* Table */}
      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Organization</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Booth / staff</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.pageItems.map((app: any) => (
              <tr key={app.id} className="border-t hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{app.organizationName}</div>
                  <div className="text-xs text-muted-foreground">{app.message ? app.message.substring(0, 50) + "…" : "—"}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs">
                  <div>{app.contactName}</div>
                  <div className="text-muted-foreground">{app.contactEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="capitalize text-xs font-semibold">{app.desiredTier}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                  {app.wantsExhibitorBooth ? "Booth requested" : "—"}
                  {app.staffCount != null ? ` · ${app.staffCount} staff` : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                      app.status === "approved"
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
                  {app.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAppId(app.id);
                          const booth = booths.find((b) => b.id === app.preferredBoothId);
                          setApproveForm({
                            tier: "",
                            adminNotes: "",
                            createExhibitorBooth: app.wantsExhibitorBooth ?? true,
                            boothId: app.preferredBoothId ?? "",
                            boothNumber: booth?.code ?? "",
                            markInvoiced: true,
                          });
                          setApproveDialogOpen(true);
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setRejectDialogOpen(true);
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1 text-red-600" /> Reject
                      </Button>
                    </>
                  )}
                  {app.status !== "pending" && (
                    <Button size="sm" variant="outline" disabled>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.pageItems.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground text-center">
            {selectedStatus ? `No ${selectedStatus} applications` : "No applications"}
          </p>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve sponsorship application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold">{selectedApp.organizationName}</div>
                <div className="text-xs text-muted-foreground">{selectedApp.contactEmail}</div>
              </div>
              <div>
                <Label>Tier override (optional)</Label>
                <Input
                  value={approveForm.tier}
                  onChange={(e) => setApproveForm({ ...approveForm, tier: e.target.value })}
                  placeholder={selectedApp.desiredTier}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Admin notes (optional)</Label>
                <Textarea
                  value={approveForm.adminNotes}
                  onChange={(e) => setApproveForm({ ...approveForm, adminNotes: e.target.value })}
                  placeholder="Internal notes…"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-booth"
                  checked={approveForm.createExhibitorBooth}
                  onChange={(e) => setApproveForm({ ...approveForm, createExhibitorBooth: e.target.checked })}
                />
                <Label htmlFor="create-booth" className="font-normal cursor-pointer">
                  Create exhibitor booth
                </Label>
              </div>
              {approveForm.createExhibitorBooth && (
                <>
                  <div>
                    <Label>Booth from map</Label>
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
                        <SelectValue placeholder="Select booth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">—</SelectItem>
                        {booths
                          .filter((b) => b.status === "available" || b.id === approveForm.boothId)
                          .map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.code}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Booth number</Label>
                    <Input
                      value={approveForm.boothNumber}
                      onChange={(e) => setApproveForm({ ...approveForm, boothNumber: e.target.value })}
                      placeholder="e.g., A-15"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setApproveDialogOpen(false)}
                  disabled={approveMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="gradient-blue text-accent-foreground"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold">{selectedApp.organizationName}</div>
                <div className="text-xs text-muted-foreground">{selectedApp.contactEmail}</div>
              </div>
              <div>
                <Label>Reason for rejection (optional)</Label>
                <Textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="This will be visible to the applicant…"
                  className="mt-1"
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={rejectMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Rejecting…
                    </>
                  ) : (
                    "Reject"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
