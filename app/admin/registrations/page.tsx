"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Download, UserPlus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";
import { ManualGroupRegistrationDialog } from "@/components/admin/ManualGroupRegistrationDialog";
import { GroupRegistrationsManager } from "@/components/group/GroupRegistrationsManager";
import { GroupRegistrationSettingsPanel } from "@/components/group/GroupRegistrationSettingsPanel";
import { useAdminCommandAction, useAdminTabNavigation } from "@/hooks/use-admin-command-action";

export default function Page() {
  const store = useStore();
  const { activeTab, onTabChange } = useAdminTabNavigation(["individual", "groups"], "individual");
  const [manualOpen, setManualOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  useAdminCommandAction({
    "manual-registration": () => setManualOpen(true),
    "add-group-registration": () => {
      onTabChange("groups");
      setGroupOpen(true);
    },
  });

  const [q, setQ] = useState("");
  const [filterVer, setFilterVer] = useState<"all" | "pending">("all");

  const rows = store.registrations.filter((r) => {
    if (r.groupId) return false;
    const matchQ = !q || [r.name, r.email, r.country, r.category].some((v) => v.toLowerCase().includes(q.toLowerCase()));
    const matchV = filterVer === "all" || r.verificationStatus === "pending";
    return matchQ && matchV;
  });

  const exportCsv = () => {
    const header = ["Name", "Email", "Country", "Category", "Amount (USD)", "Status", "Verification", "Created"];
    const csv = [
      header,
      ...rows.map((r) => [r.name, r.email, r.country, r.category, r.amountUsd, r.status, r.verificationStatus ?? "none", r.createdAt]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const revenue = store.registrations.filter((r) => r.status === "paid").reduce((a, b) => a + b.amountUsd, 0);
  const grp = store.platformSettings.groupRegistration;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Registrations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {store.registrations.length} total · ${revenue.toLocaleString()} confirmed revenue
            {grp?.enabled && (
              <>
                {" "}
                · Group discounts: {grp.minSize}–9 ({grp.tier5to9Percent}%), 10+ ({grp.tier10PlusPercent}%)
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setManualOpen(true)} className="gradient-blue text-accent-foreground">
            <UserPlus className="h-4 w-4 mr-1" /> Manual registration
          </Button>
          <Button variant="outline" onClick={() => { onTabChange("groups"); setGroupOpen(true); }}>
            <Users className="h-4 w-4 mr-1" /> Add group
          </Button>
          <Button onClick={exportCsv} variant="outline">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <ManualRegistrationDialog open={manualOpen} onOpenChange={setManualOpen} />
      <ManualGroupRegistrationDialog open={groupOpen} onOpenChange={setGroupOpen} />

      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="individual">Individual ({store.registrations.filter((r) => !r.groupId).length})</TabsTrigger>
          <TabsTrigger value="groups">Groups ({store.groupRegistrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6 space-y-8">
          <GroupRegistrationSettingsPanel />
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-serif font-bold text-lg">Registered groups</h2>
              <Button size="sm" variant="outline" asChild>
                <Link href="/register" target="_blank">
                  Preview on register page
                </Link>
              </Button>
            </div>
            <GroupRegistrationsManager basePath="/admin/registrations" />
          </div>
        </TabsContent>

        <TabsContent value="individual" className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative max-w-md flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
            </div>
            <Button variant={filterVer === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilterVer(filterVer === "pending" ? "all" : "pending")}>
              Pending verification
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Attendee</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Country</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Verification</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs">{r.category}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs">{r.country}</td>
                    <td className="px-4 py-3 text-right font-mono">${r.amountUsd}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green/15 text-green">{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary">
                        {r.verificationStatus ?? "none"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
