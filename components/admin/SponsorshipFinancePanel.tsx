"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api/client";
import { useAdminSponsors } from "@/hooks/api/useAdmin";
import {
  useAdminSponsorshipInvoiceRows,
  useMarkSponsorshipInvoicePaid,
} from "@/hooks/api/useExhibitor";
import { tierColor } from "@/components/exhibitors/exhibitor-portal-config";

type Props = {
  readOnly?: boolean;
  showSponsorCards?: boolean;
};

export function SponsorshipFinancePanel({ readOnly = false, showSponsorCards = true }: Props) {
  const { sponsors, isLoading: sponsorsLoading, isError: sponsorsError } = useAdminSponsors({ limit: 200 });
  const { rows, isLoading, isError } = useAdminSponsorshipInvoiceRows();
  const markPaid = useMarkSponsorshipInvoicePaid();

  const sponsorCount = sponsors.length;
  const sponsorshipGross = rows
    .filter((r) => r.invoice.status === "paid")
    .reduce((sum, r) => sum + (r.invoice.currency === "USD" ? r.invoice.amount : 0), 0);

  return (
    <div className="space-y-10">
      {showSponsorCards && (
        <section>
          <h2 className="font-serif font-bold text-lg mb-1">Approved sponsors</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Live sponsor records from the backend directory.
          </p>
          {sponsorsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading sponsors…
            </div>
          ) : sponsorsError ? (
            <p className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-2xl">
              Could not load sponsors from the API. Try refreshing the page.
            </p>
          ) : sponsorCount === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-2xl">
              No sponsors found in the backend directory yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="rounded-2xl bg-card border border-border p-5 hover-lift flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tierColor(sponsor.tier)}`}
                    >
                      {sponsor.tier}
                    </span>
                  </div>
                  <div className="font-serif font-bold">{sponsor.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {sponsor.websiteUrl || "No website"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 capitalize line-clamp-2">
                    {sponsor.description || "No description"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif font-bold text-lg mb-1">Sponsorship invoices</h2>
            <p className="text-sm text-muted-foreground">
              Proforma invoices from approved applications — {rows.length} on file
              {sponsorshipGross > 0 ? ` · $${sponsorshipGross.toLocaleString()} paid (USD)` : ""}.
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading sponsorship invoices…
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">
            Could not load sponsorship invoices from the API.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">
            No invoices issued yet.
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Organization</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Tier</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  {!readOnly && <th className="text-right px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ application, invoice }) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="px-4 py-3 font-mono font-medium">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div>{application.organizationName}</div>
                      <div className="text-xs text-muted-foreground">{application.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell capitalize">{invoice.tier}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {invoice.amount.toLocaleString()} {invoice.currency}
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
                    {!readOnly && (
                      <td className="px-4 py-3 text-right">
                        {invoice.status !== "paid" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={markPaid.isPending}
                            onClick={() =>
                              markPaid.mutate(
                                { id: invoice.id, notes: "Marked paid from admin finance" },
                                {
                                  onSuccess: () => toast.success("Sponsorship invoice marked paid"),
                                  onError: (err) => toast.error(apiErrorMessage(err)),
                                },
                              )
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Paid
                          </Button>
                        )}
                      </td>
                    )}
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
