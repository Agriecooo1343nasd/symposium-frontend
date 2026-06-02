"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { GroupRegistrationsManager } from "@/components/group/GroupRegistrationsManager";

export default function DeskRegistrationsPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const regs = store.registrations.filter(
    (r) =>
      !r.groupId &&
      (!q ||
        [r.name, r.email, r.country, r.category, r.details?.ticketId].some((v) =>
          String(v ?? "").toLowerCase().includes(q.toLowerCase()),
        )),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Registrations</h1>
        <p className="text-muted-foreground">Full delegate records as submitted on the public registration form.</p>
      </div>
      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="groups">Groups ({store.groupRegistrations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="mt-6">
          <GroupRegistrationsManager basePath="/desk/registrations" />
        </TabsContent>
        <TabsContent value="individual" className="mt-6 space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name, email, ticket ID…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Attendee</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Ticket</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Check-in</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {regs.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                  {r.groupId && (
                    <span className="text-[10px] uppercase text-accent">{r.groupRole}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{r.category}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.details?.ticketId ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  {r.checkedIn ? (
                    <span className="text-[10px] uppercase font-bold text-green">Checked in</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Not yet</span>
                  )}
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
