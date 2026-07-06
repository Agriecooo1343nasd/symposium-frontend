import type {
  RunOfShowItemDto,
  UpdateRunOfShowItemDto,
  UpsertRunOfShowItemDto,
} from "@/lib/api/dto";
import type { Session } from "@/lib/mock-data";
import type { RunOfShowItem } from "@/lib/store";

function normalizeTime(value?: string | null): string {
  if (!value) return "";
  if (value.includes("T")) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
  }
  return value;
}

export function dtoToRunOfShowItem(dto: RunOfShowItemDto): RunOfShowItem {
  const day = (dto.dayIndex === 2 ? 2 : 1) as 1 | 2;
  return {
    id: dto.id,
    day,
    order: dto.sortOrder,
    title: dto.title,
    startTime: normalizeTime(dto.startTime),
    endTime: normalizeTime(dto.endTime),
    type: dto.itemType,
    sessionId: dto.sessionId ?? undefined,
    status: dto.status,
    notes: dto.notes ?? undefined,
    ownerName: dto.ownerName ?? undefined,
    ownerEmail: dto.ownerEmail ?? undefined,
  };
}

export function runOfShowItemToCreateDto(
  item: RunOfShowItem,
  symposiumId: string,
): UpsertRunOfShowItemDto {
  return {
    symposiumId,
    sessionId: item.sessionId,
    itemType: item.type,
    title: item.title.trim(),
    startTime: item.startTime || undefined,
    endTime: item.endTime || undefined,
    dayIndex: item.day,
    sortOrder: item.order,
    status: item.status ?? "upcoming",
    notes: item.notes,
    ownerName: item.ownerName,
    ownerEmail: item.ownerEmail,
  };
}

export function runOfShowItemToUpdateDto(item: RunOfShowItem): UpdateRunOfShowItemDto {
  return {
    sessionId: item.sessionId,
    itemType: item.type,
    title: item.title.trim(),
    startTime: item.startTime || undefined,
    endTime: item.endTime || undefined,
    dayIndex: item.day,
    sortOrder: item.order,
    status: item.status,
    notes: item.notes,
    ownerName: item.ownerName,
    ownerEmail: item.ownerEmail,
  };
}

export function sessionToRunOfShowDto(
  session: Session,
  symposiumId: string,
  extras: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail" | "status" | "order">,
): UpsertRunOfShowItemDto {
  return {
    symposiumId,
    sessionId: session.id,
    itemType: "session",
    title: session.title.trim(),
    startTime: session.start,
    endTime: session.end,
    dayIndex: session.day,
    sortOrder: extras.order,
    status: extras.status ?? "upcoming",
    notes: extras.notes,
    ownerName: extras.ownerName,
    ownerEmail: extras.ownerEmail,
  };
}

export function nextSortOrder(items: RunOfShowItem[], day: 1 | 2): number {
  const dayItems = items.filter((i) => i.day === day);
  if (dayItems.length === 0) return 1;
  return Math.max(...dayItems.map((i) => i.order)) + 1;
}

/** Build a run-of-show row from an existing programme session (link-only; no session mutation). */
export function linkSessionToRunOfShowItem(
  session: Session,
  extras: Pick<RunOfShowItem, "notes" | "ownerName" | "ownerEmail" | "status" | "order" | "id">,
): RunOfShowItem {
  return {
    id: extras.id ?? "",
    day: session.day,
    order: extras.order,
    title: session.title,
    startTime: session.start,
    endTime: session.end,
    type: "session",
    sessionId: session.id,
    status: extras.status ?? "upcoming",
    notes: extras.notes,
    ownerName: extras.ownerName,
    ownerEmail: extras.ownerEmail,
  };
}
