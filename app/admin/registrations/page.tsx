"use client";

import { useState } from "react";
import { Search, Download, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";
import { GroupRegistrationsManager } from "@/components/group/GroupRegistrationsManager";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { useSearchParams } from "next/navigation";


export default function Page() {
  const store = useStore();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "groups" ? "groups" : "individual";
  const [manualOpen, setManualOpen] = useState(false);

  useAdminCommandAction({
    "manual-registration": () => setManualOpen(true),
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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Registrations</h1>
          <p className="text-muted-foreground">
            {store.registrations.length} total · ${revenue.toLocaleString()} confirmed revenue
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setManualOpen(true)} className="gradient-blue text-accent-foreground">
            <UserPlus className="h-4 w-4 mr-1" /> Manual registration
          </Button>
          <Button onClick={exportCsv} variant="outline">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>
      <ManualRegistrationDialog open={manualOpen} onOpenChange={setManualOpen} />

      <Tabs value={activeTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="individual">Individual ({store.registrations.filter((r) => !r.groupId).length})</TabsTrigger>
          <TabsTrigger value="groups">Groups ({store.groupRegistrations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="mt-6">
          <GroupRegistrationsManager basePath="/admin/registrations" />
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
                  {r.groupId && (
                    <span className="text-[10px] text-accent font-mono">{r.groupRole}</span>
                  )}
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
