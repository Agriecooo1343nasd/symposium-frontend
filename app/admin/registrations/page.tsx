"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, UserPlus, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";
import { ManualGroupRegistrationDialog } from "@/components/admin/ManualGroupRegistrationDialog";
import { GroupRegistrationsManager } from "@/components/group/GroupRegistrationsManager";
import { GroupRegistrationSettingsPanel } from "@/components/group/GroupRegistrationSettingsPanel";
import { useAdminCommandAction, useAdminTabNavigation } from "@/hooks/use-admin-command-action";
import { useAdminRegistrations, useExportRegistrations, registrationStatusLabel } from "@/hooks/api/useAdmin";
import { useUsersLookup } from "@/hooks/api/useUsersLookup";
import {
  registrationAttendeeLabel,
  registrationCategoryLabel,
} from "@/lib/api/mappers/registration-helpers";
import { getAccessToken } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { usersService } from "@/lib/api/services";
import { toast } from "sonner";

const PAGE_SIZE = 25;

export default function Page() {
  const { activeTab, onTabChange } = useAdminTabNavigation(["individual", "groups"], "individual");
  const [manualOpen, setManualOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [filterVer, setFilterVer] = useState<"all" | "pending_verification">("all");

  const { registrations, isLoading, isError, meta } = useAdminRegistrations({
    limit: 100,
    status: filterVer === "pending_verification" ? "pending_verification" : undefined,
  });
  const exportCsv = useExportRegistrations();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, filterVer]);

  const individual = useMemo(() => registrations.filter((r) => !r.groupId), [registrations]);
  const { usersById, isLoading: usersLoading } = useUsersLookup(individual.map((r) => r.userId));

  const userSearchQuery = useQuery({
    queryKey: queryKeys.users.list({ search: debouncedQ }),
    queryFn: () => usersService.list({ search: debouncedQ, limit: 100 }),
    enabled: typeof window !== "undefined" && Boolean(getAccessToken()) && debouncedQ.length >= 2,
    staleTime: 60_000,
  });
  const searchUserIds = useMemo(
    () => new Set((userSearchQuery.data?.items ?? []).map((u) => u.id)),
    [userSearchQuery.data?.items],
  );

  const filtered = useMemo(() => {
    const needle = debouncedQ.toLowerCase();
    return individual.filter((r) => {
      const user = usersById.get(r.userId);
      const attendee = registrationAttendeeLabel(r, user);
      if (!needle) return true;
      if (debouncedQ.length >= 2 && searchUserIds.has(r.userId)) return true;
      return [attendee.name, attendee.email, r.id, registrationCategoryLabel(r), r.status].some((v) =>
        String(v ?? "").toLowerCase().includes(needle),
      );
    });
  }, [individual, debouncedQ, usersById, searchUserIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useAdminCommandAction({
    "manual-registration": () => setManualOpen(true),
    "add-group-registration": () => {
      onTabChange("groups");
      setGroupOpen(true);
    },
  });

  const revenue = registrations
    .filter((r) => ["active", "paid", "confirmed"].includes(r.status))
    .reduce((a, b) => a + (b.amountUsd ?? 0), 0);

  const handleExport = () => {
    exportCsv.mutate(filterVer === "pending_verification" ? "pending_verification" : undefined, {
      onSuccess: (res) => {
        const blob = res.data as Blob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "registrations.csv";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export downloaded");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Export failed"),
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Registrations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {meta?.total ?? registrations.length} loaded · ${revenue.toLocaleString()} confirmed revenue (USD)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setManualOpen(true)} className="gradient-blue text-accent-foreground">
            <UserPlus className="h-4 w-4 mr-1" /> Walk-in registration
          </Button>
          <Button variant="outline" onClick={() => { onTabChange("groups"); setGroupOpen(true); }}>
            <Users className="h-4 w-4 mr-1" /> Add group (local)
          </Button>
          <Button onClick={handleExport} variant="outline" disabled={exportCsv.isPending}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <ManualRegistrationDialog open={manualOpen} onOpenChange={setManualOpen} />
      <ManualGroupRegistrationDialog open={groupOpen} onOpenChange={setGroupOpen} />

      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="individual">Individual ({individual.length})</TabsTrigger>
          <TabsTrigger value="groups">Groups (local mock)</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6 space-y-8">
          <p className="text-sm text-muted-foreground">Group admin list has no API — local mock only.</p>
          <GroupRegistrationSettingsPanel />
          <GroupRegistrationsManager basePath="/admin/registrations" />
        </TabsContent>

        <TabsContent value="individual" className="mt-6 space-y-4">
          {(isLoading || usersLoading) && <p className="text-sm text-muted-foreground">Loading…</p>}
          {isError && <p className="text-sm text-destructive">Could not load registrations.</p>}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative max-w-md flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, category…"
                className="pl-9"
              />
            </div>
            <Button
              variant={filterVer === "pending_verification" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterVer(filterVer === "pending_verification" ? "all" : "pending_verification")}
            >
              Pending verification
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Attendee</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Verification</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const attendee = registrationAttendeeLabel(r, usersById.get(r.userId));
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium">{attendee.name}</div>
                        <div className="text-xs text-muted-foreground">{attendee.email ?? "—"}</div>
                        <div className="font-mono text-[10px] text-muted-foreground/80 mt-0.5">{r.id.slice(0, 8)}…</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{registrationCategoryLabel(r)}</td>
                      <td className="px-4 py-3 text-right font-mono">${r.amountUsd ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green/15 text-green">
                          {registrationStatusLabel(r.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary">
                          {r.verificationStatus ?? "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pageRows.length === 0 && !isLoading && (
              <p className="p-8 text-center text-sm text-muted-foreground">No registrations match your filters.</p>
            )}
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center px-2 text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Attendee names load from the users API.{" "}
            <Link href="/desk/registrations" className="text-accent hover:underline">
              Desk detail
            </Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
