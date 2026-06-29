import type { ExhibitorLeadDto } from "@/lib/api/dto";

const KEY = "nas_exhibitor_leads";

export type StoredExhibitorLead = ExhibitorLeadDto & {
  boothNotes?: string;
  crmStatus?: string;
};

export function loadExhibitorLeads(exhibitorId: string): StoredExhibitorLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, StoredExhibitorLead[]>;
    return all[exhibitorId] ?? [];
  } catch {
    return [];
  }
}

export function saveExhibitorLead(exhibitorId: string, lead: StoredExhibitorLead): StoredExhibitorLead[] {
  const existing = loadExhibitorLeads(exhibitorId);
  const idx = existing.findIndex((l) => l.id === lead.id);
  const next =
    idx >= 0 ? existing.map((l, i) => (i === idx ? { ...l, ...lead } : l)) : [lead, ...existing];
  const raw = localStorage.getItem(KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, StoredExhibitorLead[]>) : {};
  all[exhibitorId] = next;
  localStorage.setItem(KEY, JSON.stringify(all));
  return next;
}

export function updateStoredLead(
  exhibitorId: string,
  leadId: string,
  patch: Partial<StoredExhibitorLead>,
): StoredExhibitorLead[] {
  const existing = loadExhibitorLeads(exhibitorId);
  const next = existing.map((l) => (l.id === leadId ? { ...l, ...patch } : l));
  const raw = localStorage.getItem(KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, StoredExhibitorLead[]>) : {};
  all[exhibitorId] = next;
  localStorage.setItem(KEY, JSON.stringify(all));
  return next;
}

export function exportLeadsCsv(leads: StoredExhibitorLead[]): string {
  const header = "Name,Email,Scanned At,Status,Notes";
  const rows = leads.map((l) =>
    [
      l.attendeeName ?? "",
      l.attendeeEmail ?? "",
      l.scannedAt,
      l.crmStatus ?? "New",
      (l.boothNotes ?? "").replace(/"/g, '""'),
    ]
      .map((v) => `"${v}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}
