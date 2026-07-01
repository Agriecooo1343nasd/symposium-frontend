import type { RegistrationDto, RegistrationStatus, UserDto } from "../dto";

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

export function registrationDisplayAmount(
  reg: RegistrationDto,
  currency: "USD" | "RWF" = "USD",
  exchangeRate = 1300,
): string {
  const c = (reg.currency as "USD" | "RWF") ?? currency;
  if (c === "RWF" && reg.amountRwf != null) {
    return `RWF ${Math.round(reg.amountRwf).toLocaleString()}`;
  }
  if (reg.amountUsd != null) {
    return `$${reg.amountUsd.toLocaleString()}`;
  }
  if (reg.ticketCategory) {
    if (c === "RWF") return `RWF ${Math.round(reg.ticketCategory.priceRwf).toLocaleString()}`;
    return `$${reg.ticketCategory.priceUsd.toLocaleString()}`;
  }
  return "—";
}

export function formatRegistrationExpiry(expiresAt?: string | null): string | null {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
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

export function registrationAttendeeLabel(
  reg: RegistrationDto,
  user?: Pick<UserDto, "firstName" | "lastName" | "email"> | null,
): { name: string; email: string | null } {
  if (user) {
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    const name = [first, last].filter(Boolean).join(" ") || user.email;
    return { name, email: user.email };
  }
  return { name: `User ${reg.userId.slice(0, 8)}…`, email: null };
}
