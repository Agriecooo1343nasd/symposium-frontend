"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getInvoicesForOrg, markInvoicePaid } from "@/lib/sponsorship-invoices";
import { isSponsorOrg } from "@/lib/sponsorship-records";
import { tierColor } from "@/components/exhibitors/exhibitor-portal-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  actorName?: string;
  readOnly?: boolean;
  basePath?: "/admin/exhibitors" | "/desk/exhibitors";
};

export function SponsorshipRecordsList({ actorName = "Admin", readOnly = false, basePath = "/admin/exhibitors" }: Props) {
  const store = useStore();
  const sponsors = store.approvedOrganizations.filter(isSponsorOrg);
  const invoices = store.sponsorshipInvoices ?? [];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif font-bold text-lg mb-1">Sponsor records</h2>
        <p className="text-sm text-muted-foreground mb-4">
          One record per approved sponsor — package, invoices, benefits, and deliverables (same view as the exhibitor portal).
        </p>
        {sponsors.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-2xl">
            No approved sponsors yet. Approve a sponsorship application or use Add sponsor.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsors.map((org) => {
              const inv = getInvoicesForOrg(org.id)[0];
              const deliverableCount = store.sponsorshipDeliverables.filter((d) => d.orgId === org.id).length;
              return (
                <div key={org.id} className="rounded-2xl bg-card border border-border p-5 hover-lift flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(org.sponsorshipTier ?? "Silver")}`}>
                      {org.sponsorshipTier ?? "—"}
                    </span>
                    {inv && (
                      <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", inv.status === "paid" ? "bg-green/15 text-green" : "bg-amber-100 text-amber-800")}>
                        {inv.status === "paid" ? "Paid" : "Invoice open"}
                      </span>
                    )}
                  </div>
                  <div className="font-serif font-bold">{org.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">{org.participation} · Booth {org.booth}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {deliverableCount} deliverable{deliverableCount === 1 ? "" : "s"} · {org.leads} leads
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                    <Link href={readOnly ? `${basePath}/application/${org.applicationId}` : `/admin/exhibitors/sponsorship/${org.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> {readOnly ? "View application" : "Open record"} <ArrowRight className="h-3 w-3 ml-auto" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif font-bold text-lg mb-1">All sponsorship invoices</h2>
        <p className="text-sm text-muted-foreground mb-4">Central list — also visible on each sponsor record.</p>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">No invoices issued yet.</p>
        ) : (
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Reference</th>
                  <th className="text-left px-4 py-3">Organization</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Tier</th>
                  <th className="text-right px-4 py-3">USD</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t">
                    <td className="px-4 py-3 font-mono font-medium">{inv.reference}</td>
                    <td className="px-4 py-3">
                      <div>{inv.orgName}</div>
                      <div className="text-xs text-muted-foreground">{inv.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{inv.tier}</td>
                    <td className="px-4 py-3 text-right font-mono">${inv.amountUsd.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", inv.status === "paid" ? "bg-green/15 text-green" : "bg-amber-100 text-amber-800")}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {inv.orgId && !readOnly && (
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/exhibitors/sponsorship/${inv.orgId}`}>Record</Link>
                        </Button>
                      )}
                      {!readOnly && inv.status !== "paid" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markInvoicePaid(inv.id, actorName);
                            toast.success("Payment recorded");
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
