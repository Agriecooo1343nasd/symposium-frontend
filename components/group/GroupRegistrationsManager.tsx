"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminGroups } from "@/hooks/api/useAdmin";
import { cn } from "@/lib/utils";

type Props = {
  basePath: "/admin/registrations" | "/desk/registrations";
};

const paymentStatusLabel: Record<string, string> = {
  comp: "Complimentary",
  paid: "Paid",
  pending: "Pending payment",
};

export function GroupRegistrationsManager({ basePath }: Props) {
  const [q, setQ] = useState("");
  const { groups, isLoading } = useAdminGroups({ search: q || undefined });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = groups.find((g) => g.id === selectedId) ?? groups[0];

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search group code, org, representative…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Group</th>
                <th className="text-left px-4 py-3">Rep</th>
                <th className="text-left px-4 py-3">Seats</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.id}
                  className={cn(
                    "border-t cursor-pointer hover:bg-secondary/40",
                    selected?.id === g.id && "bg-accent/10",
                  )}
                  onClick={() => setSelectedId(g.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-xs">{g.groupCode}</div>
                    <div className="font-medium">{g.organizationName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div>{g.representativeName}</div>
                    <div className="text-muted-foreground">{g.representativeEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    {g.seatCount}
                    {g.discountPercent > 0 && (
                      <div className="text-[10px] text-green">−{g.discountPercent}%</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">${g.totalUsd.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">
                    {g.checkedInCount}/{g.seatCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <p className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading group registrations…
            </p>
          ) : groups.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No group registrations yet.</p>
          ) : null}
        </div>

        {selected && (
          <div className="rounded-2xl border bg-card p-5 space-y-4 lg:sticky lg:top-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <h3 className="font-serif font-bold">{selected.groupCode}</h3>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-mono">${selected.subtotalUsd.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="font-mono text-green">−${(selected.subtotalUsd - selected.totalUsd).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Paid total</dt>
                <dd className="font-mono font-bold">${selected.totalUsd.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="capitalize">{paymentStatusLabel[selected.paymentStatus] ?? selected.paymentStatus}</dd>
              </div>
            </dl>
            <ul className="space-y-2 max-h-[320px] overflow-y-auto">
              {selected.members.map((m) => (
                <li key={m.registrationId} className="flex justify-between gap-2 text-sm border-b pb-2 last:border-0">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("text-[10px] font-bold uppercase", m.checkedIn ? "text-green" : "text-muted-foreground")}>
                      {m.checkedIn ? "In" : "Out"}
                    </div>
                    {basePath === "/desk/registrations" && (
                      <Button asChild variant="ghost" size="sm" className="h-6 px-1 mt-1">
                        <Link href={`${basePath}/${m.registrationId}`}>
                          <Eye className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
