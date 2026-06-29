import type { NotificationDto } from "../dto";

export type NotificationView = {
  id: string;
  type: "session" | "connection" | "system" | "announcement";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href?: string;
};

function mapNotificationType(type: string): NotificationView["type"] {
  if (type === "session_reminder") return "session";
  if (type === "connection") return "connection";
  if (type === "announcement" || type === "broadcast") return "announcement";
  return "system";
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { dateStyle: "medium" });
}

function notificationHref(n: NotificationDto): string | undefined {
  const data = n.data as Record<string, unknown> | null | undefined;
  if (n.type === "session_reminder" && typeof data?.sessionId === "string") {
    return `/programme/${data.sessionId}`;
  }
  if (n.type === "submission" || n.type === "review") return "/dashboard/apply";
  if (n.type === "registration" || n.type === "payment") return "/dashboard/ticket";
  if (n.type === "refund") return "/dashboard/refunds";
  if (n.type === "certificate") return "/dashboard/certificate";
  if (n.type === "announcement") return "/dashboard/notifications";
  return "/dashboard/notifications";
}

export function mapNotificationDto(dto: NotificationDto): NotificationView {
  return {
    id: dto.id,
    type: mapNotificationType(dto.type),
    title: dto.title,
    body: dto.body,
    time: formatRelativeTime(dto.createdAt),
    unread: !dto.readAt,
    href: notificationHref(dto),
  };
}

export function mapNotifications(dtos: NotificationDto[]): NotificationView[] {
  return dtos.map(mapNotificationDto);
}
