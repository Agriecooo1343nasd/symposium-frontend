import type { RegistrationDto, RegistrationStatus } from "../dto";

const PAID_STATUSES: RegistrationStatus[] = [
  "active",
  "paid",
  "confirmed",
  "pending_verification",
  "refund_requested",
];

export function isRegistrationPaid(reg?: RegistrationDto | null): boolean {
  if (!reg) return false;
  return PAID_STATUSES.includes(reg.status) || Boolean(reg.paidAt);
}

export function primaryRegistration(regs: RegistrationDto[]): RegistrationDto | null {
  if (!regs.length) return null;
  const paid = regs.find((r) => isRegistrationPaid(r));
  return paid ?? regs[0];
}

export function registrationCategoryLabel(reg?: RegistrationDto | null): string {
  return reg?.ticketCategory?.name ?? "Delegate";
}

export function registrationStatusLabel(status: RegistrationStatus): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    pending_payment: "Pending payment",
    pending_verification: "Pending verification",
    active: "Confirmed",
    paid: "Paid",
    confirmed: "Confirmed",
    waitlisted: "Waitlisted",
    cancelled: "Cancelled",
    rejected: "Rejected",
    expired: "Expired",
    refund_requested: "Refund requested",
    refunded: "Refunded",
  };
  return labels[status] ?? status;
}
