import { loadStore, type SponsorshipInvoice, type StoreRegistration } from "./store";

export type FinanceLineItem = {
  id: string;
  kind: "registration" | "sponsorship";
  payer: string;
  email: string;
  method: string;
  reference: string;
  amountUsd: number;
  amountRwf?: number;
  status: "completed" | "pending" | "refunded" | "issued" | "paid" | "cancelled" | "pending_payment";
  at: string;
  tier?: string;
  invoiceId?: string;
  registrationId?: string;
};

function registrationToLine(reg: StoreRegistration): FinanceLineItem {
  const method = reg.details?.paymentMethod ?? "Card";
  const ref = reg.details?.ticketId ?? reg.id;
  let status: FinanceLineItem["status"] = "pending";
  if (reg.status === "paid" || reg.status === "comp") status = "completed";
  return {
    id: `reg-${reg.id}`,
    kind: "registration",
    payer: reg.name,
    email: reg.email,
    method: method === "momo" ? "MoMo MTN" : method === "airtel" ? "Airtel Money" : method === "bank" ? "Bank Transfer" : method === "card" ? "Card" : method,
    reference: ref,
    amountUsd: reg.amountUsd,
    status,
    at: reg.createdAt ?? "",
    registrationId: reg.id,
  };
}

function invoiceToLine(inv: SponsorshipInvoice): FinanceLineItem {
  let status: FinanceLineItem["status"] =
    inv.status === "paid"
      ? "completed"
      : inv.status === "issued" || inv.status === "pending_payment"
        ? "pending"
        : inv.status;
  return {
    id: `inv-${inv.id}`,
    kind: "sponsorship",
    payer: inv.orgName,
    email: inv.contactEmail,
    method: "Bank Transfer",
    reference: inv.reference,
    amountUsd: inv.amountUsd,
    amountRwf: inv.amountRwf,
    status,
    at: inv.issuedAt,
    tier: inv.tier,
    invoiceId: inv.id,
  };
}

export function getFinanceLineItems(): FinanceLineItem[] {
  const store = loadStore();
  const regs = (store.registrations ?? []).map(registrationToLine);
  const invs = (store.sponsorshipInvoices ?? []).map(invoiceToLine);
  return [...invs, ...regs].sort((a, b) => (b.at > a.at ? 1 : -1));
}

export function getFinanceSummary() {
  const items = getFinanceLineItems();
  const completed = items.filter((i) => i.status === "completed" || i.status === "paid");
  const pending = items.filter((i) => i.status === "pending" || i.status === "issued");
  const refunded = items.filter((i) => i.status === "refunded");
  const gross = completed.reduce((n, i) => n + i.amountUsd, 0);
  const pendingValue = pending.reduce((n, i) => n + i.amountUsd, 0);
  const refundedValue = refunded.reduce((n, i) => n + i.amountUsd, 0);
  const sponsorshipGross = completed.filter((i) => i.kind === "sponsorship").reduce((n, i) => n + i.amountUsd, 0);
  const registrationGross = completed.filter((i) => i.kind === "registration").reduce((n, i) => n + i.amountUsd, 0);
  const methodData = ["MoMo MTN", "Airtel Money", "Card", "Bank Transfer"].map((m) => ({
    name: m,
    value: completed.filter((i) => i.method === m).reduce((n, i) => n + i.amountUsd, 0),
  }));
  return {
    items,
    completed,
    pending,
    refunded,
    gross,
    pendingValue,
    refundedValue,
    sponsorshipGross,
    registrationGross,
    methodData,
  };
}
