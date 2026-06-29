"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download, UserPlus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";
import { ManualGroupRegistrationDialog } from "@/components/admin/ManualGroupRegistrationDialog";
import { GroupRegistrationsManager } from "@/components/group/GroupRegistrationsManager";
import { GroupRegistrationSettingsPanel } from "@/components/group/GroupRegistrationSettingsPanel";
import { useAdminCommandAction, useAdminTabNavigation } from "@/hooks/use-admin-command-action";
import { useAdminRegistrations, useExportRegistrations, registrationStatusLabel } from "@/hooks/api/useAdmin";
import { registrationCategoryLabel } from "@/lib/api/mappers/registration-helpers";
import { toast } from "sonner";

export default function Page() {
  const { activeTab, onTabChange } = useAdminTabNavigation(["individual", "groups"], "individual");
  const [manualOpen, setManualOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [q, setQ] = useState("");
  const [filterVer, setFilterVer] = useState<"all" | "pending_verification">("all");

  const { registrations, isLoading, isError } = useAdminRegistrations({ limit: 200 });
  const exportCsv = useExportRegistrations();

  useAdminCommandAction({
    "manual-registration": () => setManualOpen(true),
    "add-group-registration": () => {
      onTabChange("groups");
      setGroupOpen(true);
    },
  });

  const rows = useMemo(() => {
    const individual = registrations.filter((r) => !r.groupId);
    return individual.filter((r) => {
      const matchQ =
        !q ||
        [r.id, r.userId, registrationCategoryLabel(r), r.status].some((v) =>
          String(v ?? "").toLowerCase().includes(q.toLowerCase()),
        );
      const matchV = filterVer === "all" || r.status === "pending_verification";
      return matchQ && matchV;
    });
  }, [registrations, q, filterVer]);

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
            {registrations.length} total · ${revenue.toLocaleString()} confirmed revenue (USD)
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
          <TabsTrigger value="individual">Individual ({registrations.filter((r) => !r.groupId).length})</TabsTrigger>
          <TabsTrigger value="groups">Groups (local mock)</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6 space-y-8">
          <p className="text-sm text-muted-foreground">Group admin list has no API — local mock only.</p>
          <GroupRegistrationSettingsPanel />
          <GroupRegistrationsManager basePath="/admin/registrations" />
        </TabsContent>

        <TabsContent value="individual" className="mt-6 space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {isError && <p className="text-sm text-destructive">Could not load registrations.</p>}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative max-w-md flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, user, category…" className="pl-9" />
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
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Registration</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Verification</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{r.id.slice(0, 8)}…</div>
                      <div className="text-xs text-muted-foreground">user {r.userId.slice(0, 8)}…</div>
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
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Attendee name/email not on registration DTO — see backend gap report.{" "}
            <Link href="/desk/registrations" className="text-accent hover:underline">
              Desk detail
            </Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
