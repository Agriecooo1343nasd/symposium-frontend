import { loadStore, patchStore, uid, appendAudit, calculateOrgPackageFee, type OrganizationApplication, type SponsorshipTier } from "./store";
import { getPlatformSettings } from "./platform-settings";

import type { SponsorshipInvoice } from "./store";

export type { SponsorshipInvoice };

export function getInvoicesForOrg(orgId: string) {
  const store = loadStore();
  const org = store.approvedOrganizations.find((o) => o.id === orgId);
  return store.sponsorshipInvoices.filter(
    (inv) => inv.orgId === orgId || (org && inv.applicationId === org.applicationId),
  );
}

export function getInvoicesForApplication(applicationId: string) {
  return loadStore().sponsorshipInvoices.filter((inv) => inv.applicationId === applicationId);
}

export function issueSponsorshipInvoice(app: OrganizationApplication, adminName: string, orgId?: string) {
  const store = loadStore();
  const fee = calculateOrgPackageFee(
    app.participation,
    app.sponsorshipTier,
    app.staffCount ?? 2,
    store,
  );
  const amountUsd = app.quotedFeeUsd ?? fee.feeUsd;
  const rate = getPlatformSettings().exchangeRate;
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const inv: SponsorshipInvoice = {
    id: uid("inv"),
    reference: `NAS26-INV-${String(store.sponsorshipInvoices.length + 1042).padStart(4, "0")}`,
    applicationId: app.id,
    orgId,
    orgName: app.companyName,
    contactEmail: app.contactEmail,
    tier: app.sponsorshipTier ?? "Silver",
    participation: app.participation,
    amountUsd,
    amountRwf: Math.round(amountUsd * rate),
    status: "issued",
    type: "proforma",
    issuedAt: new Date().toISOString(),
    dueDate: due.toISOString().slice(0, 10),
    issuedBy: adminName,
    notes:
      app.participation === "sponsor" || app.participation === "both"
        ? "Proforma invoice for sponsorship fee (FR-5.1). Payment confirms booth and benefits."
        : "Exhibitor booth package invoice.",
  };
  patchStore((s) => ({
    ...s,
    sponsorshipInvoices: [inv, ...s.sponsorshipInvoices],
    organizationApplications: s.organizationApplications.map((a) =>
      a.id === app.id ? { ...a, paymentStatus: "unpaid" as const } : a,
    ),
  }));
  appendAudit(adminName, "Issued sponsorship invoice", `${inv.reference} · ${app.companyName}`);
  return inv;
}

export function markInvoicePaid(invoiceId: string, adminName: string, paymentMethod = "Bank transfer") {
  const inv = loadStore().sponsorshipInvoices.find((i) => i.id === invoiceId);
  if (!inv) return;
  patchStore((s) => ({
    ...s,
    sponsorshipInvoices: s.sponsorshipInvoices.map((i) =>
      i.id === invoiceId
        ? {
            ...i,
            status: "paid" as const,
            paidAt: new Date().toISOString(),
            paymentMethod,
          }
        : i,
    ),
    organizationApplications: s.organizationApplications.map((a) =>
      a.id === inv.applicationId ? { ...a, paymentStatus: "paid" as const } : a,
    ),
    approvedOrganizations: s.approvedOrganizations.map((o) =>
      o.applicationId === inv.applicationId
        ? { ...o, sponsorshipPaidThrough: new Date().toISOString().slice(0, 10) }
        : o,
    ),
  }));
  appendAudit(adminName, "Confirmed sponsorship payment", inv.reference);
}
