import type { RegistrationDto } from "../dto";

export type RegistrationView = RegistrationDto & {
  displayStatus: string;
  isPaid: boolean;
  isActive: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_payment: "Pending payment",
  pending_verification: "Pending verification",
  active: "Active",
  cancelled: "Cancelled",
  expired: "Expired",
  waitlisted: "Waitlisted",
};

export function mapRegistrationDto(dto: RegistrationDto): RegistrationView {
  return {
    ...dto,
    displayStatus: STATUS_LABELS[dto.status] ?? dto.status,
    isPaid: dto.status === "active" || Boolean(dto.paidAt),
    isActive: dto.status === "active",
  };
}

export function mapRegistrations(dtos: RegistrationDto[]): RegistrationView[] {
  return dtos.map(mapRegistrationDto);
}
