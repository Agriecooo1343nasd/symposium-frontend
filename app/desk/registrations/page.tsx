"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupRegistrationsManager } from "@/components/group/GroupRegistrationsManager";
import { useDeskRegistrations, registrationStatusLabel } from "@/hooks/api/useDesk";
import { registrationCategoryLabel } from "@/lib/api/mappers/registration-helpers";

export default function DeskRegistrationsPage() {
  const [q, setQ] = useState("");
  const { registrations, isLoading, isError } = useDeskRegistrations({ limit: 100 });

  const regs = useMemo(() => {
    const individual = registrations.filter((r) => !r.groupId);
    if (!q.trim()) return individual;
    const needle = q.toLowerCase();
    return individual.filter((r) =>
      [r.id, r.userId, r.status, registrationCategoryLabel(r)].some((v) =>
        String(v ?? "").toLowerCase().includes(needle),
      ),
    );
  }, [registrations, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Registrations</h1>
        <p className="text-muted-foreground">Delegate registrations from the hosted API.</p>
      </div>
      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="groups">Groups (local)</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Group registration list has no admin API endpoint yet — showing local mock data.
          </p>
          <GroupRegistrationsManager basePath="/desk/registrations" />
        </TabsContent>
        <TabsContent value="individual" className="mt-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID, user ID, category, status…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          {isLoading && <p className="text-sm text-muted-foreground">Loading registrations…</p>}
          {isError && <p className="text-sm text-destructive">Could not load registrations.</p>}
          <div className="rounded-md border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Registration</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Paid</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{r.id.slice(0, 8)}…</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{registrationCategoryLabel(r)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.userId.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">
                        {registrationStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.paidAt ? new Date(r.paidAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/desk/registrations/${r.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Link>
                      </Button>
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
