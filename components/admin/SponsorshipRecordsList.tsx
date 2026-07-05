"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useListSponsorshipApplications,
  useMarkSponsorshipInvoicePaid,
  useSponsorshipFinanceRecords,
} from "@/hooks/api/useExhibitor";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { tierColor } from "@/components/exhibitors/exhibitor-portal-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api/client";

type Props = {
  actorName?: string;
  readOnly?: boolean;
  basePath?: "/admin/exhibitors" | "/desk/exhibitors";
};

export function SponsorshipRecordsList({ actorName = "Admin", readOnly = false, basePath = "/admin/exhibitors" }: Props) {
  const symposiumId = useSymposiumId();
  const { applications = [], isLoading: appsLoading } = useListSponsorshipApplications(symposiumId || undefined);
  const { records, isLoading: invoicesLoading } = useSponsorshipFinanceRecords(symposiumId || undefined);
  const markPaid = useMarkSponsorshipInvoicePaid();

  const sponsors = applications.filter((app) => ["approved", "invoiced"].includes(app.status));
  const loading = appsLoading || invoicesLoading;

  const markInvoicePaid = (invoiceId: string) => {
    markPaid.mutate(
      { id: invoiceId, notes: `Marked paid by ${actorName}` },
      {
        onSuccess: () => toast.success("Sponsorship invoice marked paid"),
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading sponsorship records…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif font-bold text-lg mb-1">Sponsor records</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Approved sponsorship applications from the live API — manage pending items on the Sponsorship applications tab.
        </p>
        {sponsors.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-2xl">
            No approved sponsors yet. Review applications under Sponsorship applications.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsors.map((app) => {
              const invoice = records.find((r) => r.application.id === app.id)?.invoice;
              return (
                <div key={app.id} className="rounded-2xl bg-card border border-border p-5 hover-lift flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(app.desiredTier)}`}>
                      {app.desiredTier}
                    </span>
                    {invoice && (
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                          invoice.status === "paid" ? "bg-green/15 text-green" : "bg-amber-100 text-amber-800",
                        )}
                      >
                        {invoice.status === "paid" ? "Paid" : "Invoice open"}
                      </span>
                    )}
                  </div>
                  <div className="font-serif font-bold">{app.organizationName}</div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {app.wantsExhibitorBooth ? "Exhibitor + sponsor" : "Sponsor"} · {app.status}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{app.contactEmail}</div>
                  {!readOnly && (
                    <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                      <Link href={`${basePath}?tab=sponsorship-applications`}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View applications <ArrowRight className="h-3 w-3 ml-auto" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif font-bold text-lg mb-1">All sponsorship invoices</h2>
        <p className="text-sm text-muted-foreground mb-4">Proforma invoices issued on approval (SRS FR-5.1).</p>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">
            No invoices issued yet.
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Reference</th>
                  <th className="text-left px-4 py-3">Organization</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Tier</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(({ application, invoice }) => {
                  if (!invoice) return null;
                  return (
                    <tr key={invoice.id} className="border-t">
                      <td className="px-4 py-3 font-mono font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        <div>{application.organizationName}</div>
                        <div className="text-xs text-muted-foreground">{application.contactEmail}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell capitalize">{invoice.tier}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                            invoice.status === "paid" ? "bg-green/15 text-green" : "bg-amber-100 text-amber-800",
                          )}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {!readOnly && invoice.status !== "paid" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={markPaid.isPending}
                            onClick={() => markInvoicePaid(invoice.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
