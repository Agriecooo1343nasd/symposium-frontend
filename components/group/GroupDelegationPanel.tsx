"use client";

import Link from "next/link";
import { Users, CheckCircle2, Circle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getGroupByRepresentativeEmail,
  getGroupCheckInSummary,
  getGroupForRegistration,
} from "@/lib/group-registration";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
  /** Representative sees full roster; members see delegation badge only */
  variant: "representative" | "member";
};

export function GroupDelegationPanel({ email, variant }: Props) {
  const store = useStore();
  const group =
    variant === "representative"
      ? getGroupByRepresentativeEmail(email)
      : getGroupForRegistration(store.registrations.find((r) => r.email.toLowerCase() === email.toLowerCase())?.id ?? "");

  if (!group) return null;

  const { members, checkedIn, total } = getGroupCheckInSummary(group.id);
  const isRep = variant === "representative";

  return (
    <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 to-card p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {isRep ? "Your delegation" : "Group registration"}
          </div>
          <h2 className="font-serif text-xl font-bold mt-1">{group.orgName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Code <span className="font-mono font-medium">{group.code}</span> · {group.categoryName} ·{" "}
            {group.discountPercent > 0 && (
              <span className="text-green font-medium">{group.discountPercent}% group discount applied</span>
            )}
          </p>
        </div>
        {isRep && (
          <div className="text-right">
            <div className="font-serif text-2xl font-bold">
              {checkedIn}/{total}
            </div>
            <div className="text-xs text-muted-foreground">checked in</div>
          </div>
        )}
      </div>

      {!isRep && (
        <p className="text-sm text-muted-foreground">
          Representative: <span className="font-medium text-foreground">{group.representativeName}</span> (
          {group.representativeEmail})
        </p>
      )}

      {isRep && (
        <>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full gradient-blue transition-all"
              style={{ width: `${total ? (checkedIn / total) * 100 : 0}%` }}
            />
          </div>
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Delegate</th>
                  <th className="text-left px-4 py-2">Ticket ID</th>
                  <th className="text-left px-4 py-2">Check-in</th>
                  <th className="text-right px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.email}</div>
                      {m.groupRole === "representative" && (
                        <span className="text-[10px] uppercase font-bold text-accent">You (rep)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{m.details?.ticketId ?? "—"}</td>
                    <td className="px-4 py-3">
                      {m.checkedIn ? (
                        <span className="inline-flex items-center gap-1 text-green text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {m.checkedInAt ? new Date(m.checkedInAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "Yes"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <Circle className="h-3.5 w-3.5" /> Not yet
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                          m.groupRole === "representative" ? "bg-accent/15 text-accent" : "bg-secondary",
                        )}
                      >
                        {m.groupRole === "representative" ? "Rep" : "Member"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/ticket">
                <QrCode className="h-3.5 w-3.5 mr-1" /> Your ticket
              </Link>
            </Button>
            <Button asChild size="sm" className="gradient-blue text-accent-foreground">
              <Link href="/dashboard/group">Full delegation view</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
