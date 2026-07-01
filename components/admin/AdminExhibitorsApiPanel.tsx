"use client";

import { useAdminExhibitors } from "@/hooks/api/useAdmin";

export function AdminExhibitorsApiPanel() {
  const { exhibitors, isLoading, isError } = useAdminExhibitors({ limit: 100 });

  return (
    <div className="space-y-4 mb-8">
      <div>
        <h2 className="font-serif font-bold text-lg">Exhibitors (API)</h2>
        <p className="text-sm text-muted-foreground">Exhibitor records from the live directory. Booth map, applications, and sponsorship below remain local mock.</p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Could not load exhibitors.</p>}
      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Company</th>
              <th className="text-left px-4 py-3">Booth</th>
              <th className="text-left px-4 py-3">Staff passes</th>
              <th className="text-left px-4 py-3">Contact user</th>
            </tr>
          </thead>
          <tbody>
            {exhibitors.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-3 font-medium">{e.companyName ?? "—"}</td>
                <td className="px-4 py-3">{e.boothNumber ?? "—"}</td>
                <td className="px-4 py-3">{e.staffPassQuota}</td>
                <td className="px-4 py-3 font-mono text-xs">{e.contactUserId.slice(0, 8)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
        {exhibitors.length === 0 && !isLoading && (
          <p className="p-6 text-sm text-muted-foreground text-center">No exhibitor records yet.</p>
        )}
      </div>
    </div>
  );
}
