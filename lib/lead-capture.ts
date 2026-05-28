import {
  loadStore,
  patchStore,
  uid,
  findRegistrationByTicketId,
  getExhibitorOrgId,
  type ExhibitorLead,
  type StoreRegistration,
} from "./store";
import { getProfile } from "./networking-ops";

export type ResolvedAttendee = {
  registration: StoreRegistration;
  ticketId: string;
  profile?: ReturnType<typeof getProfile>;
  allowExhibitorContact: boolean;
};

export function parseAttendeeQrPayload(raw: string): { ticketId: string } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Empty scan" };
  try {
    const parsed = JSON.parse(trimmed) as { id?: string };
    if (parsed.id) return { ticketId: String(parsed.id).trim().toUpperCase() };
  } catch {
    /* plain ticket id or JSON from badge */
  }
  const upper = trimmed.toUpperCase();
  const match = upper.match(/NAS26-[A-Z0-9-]+/);
  if (match) return { ticketId: match[0] };
  if (upper.startsWith("NAS26-")) return { ticketId: upper.split(/\s/)[0] };
  return { error: "Unrecognized badge. Scan the attendee e-ticket QR from their dashboard." };
}

export function resolveAttendeeFromQr(raw: string): ResolvedAttendee | { error: string } {
  const parsed = parseAttendeeQrPayload(raw);
  if ("error" in parsed) return parsed;

  const reg = findRegistrationByTicketId(parsed.ticketId);
  if (!reg) {
    return { error: `No registration found for ticket ${parsed.ticketId}. Attendee must be confirmed and paid.` };
  }
  if (reg.status !== "paid" && reg.status !== "comp") {
    return { error: `${reg.name} is not checked in — registration status: ${reg.status}.` };
  }

  const profile = getProfile(reg.email);
  const allowExhibitorContact = profile?.allowExhibitorContact !== false;

  return {
    registration: reg,
    ticketId: parsed.ticketId,
    profile,
    allowExhibitorContact,
  };
}

export function exhibitorHasLeadCapture(orgId?: string) {
  const store = loadStore();
  const id = orgId ?? getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === id);
  if (!org) return false;
  if (org.participation === "exhibitor" && !org.sponsorshipTier) return false;
  const tier = store.sponsorshipTiers.find((t) => t.tier === org.sponsorshipTier);
  return tier?.leadCapture ?? false;
}

export function captureLeadFromScan(params: {
  orgId: string;
  attendee: ResolvedAttendee;
  boothNotes: string;
  interestSummary?: string;
  status?: ExhibitorLead["status"];
  scannedBy?: string;
}) {
  if (!params.attendee.allowExhibitorContact) {
    return {
      ok: false as const,
      error: "This attendee has not consented to share contact details with exhibitors (privacy settings).",
    };
  }

  const reg = params.attendee.registration;
  const profile = params.attendee.profile;
  const interests = profile?.subThemeInterests ?? reg.details?.interests ?? [];
  const interestStr =
    params.interestSummary?.trim() ||
    interests.slice(0, 2).join(", ") ||
    "Booth conversation";

  const now = new Date();
  const iso = now.toISOString();
  const displayTime = now.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const existing = loadStore().exhibitorLeads.find(
    (l) => l.orgId === params.orgId && l.attendeeEmail === reg.email,
  );

  const historyEntry = {
    at: iso,
    note: params.boothNotes.trim() || "Badge scanned at booth",
    by: params.scannedBy,
  };

  let lead: ExhibitorLead;

  if (existing) {
    lead = {
      ...existing,
      boothNotes: params.boothNotes.trim() || existing.boothNotes,
      status: params.status ?? existing.status,
      history: [...(existing.history ?? []), historyEntry],
      capturedAt: displayTime,
      capturedAtIso: iso,
    };
    patchStore((s) => ({
      ...s,
      exhibitorLeads: s.exhibitorLeads.map((l) => (l.id === existing.id ? lead : l)),
    }));
    return { ok: true as const, lead, updated: true as const };
  }

  lead = {
    id: uid("ld"),
    orgId: params.orgId,
    registrationId: reg.id,
    attendeeEmail: reg.email,
    ticketId: params.attendee.ticketId,
    name: reg.name,
    title: profile?.title ?? reg.details?.title ?? "",
    org: profile?.org ?? reg.details?.org ?? "",
    country: reg.country,
    phone: reg.details?.phone,
    email: reg.email,
    interests: interests as string[],
    interest: interestStr,
    capturedAt: displayTime,
    capturedAtIso: iso,
    captureMethod: "qr_scan",
    scannedBy: params.scannedBy,
    boothNotes: params.boothNotes.trim(),
    status: params.status ?? "None",
    consentGranted: true,
    history: [historyEntry],
  };

  patchStore((s) => {
    const leads = [lead, ...s.exhibitorLeads];
    return {
      ...s,
      exhibitorLeads: leads,
      approvedOrganizations: s.approvedOrganizations.map((o) =>
        o.id === params.orgId ? { ...o, leads: leads.filter((l) => l.orgId === params.orgId).length } : o,
      ),
    };
  });

  return { ok: true as const, lead, updated: false as const };
}

export function getLeadAnalytics(orgId: string) {
  const leads = loadStore().exhibitorLeads.filter((l) => l.orgId === orgId);
  const interestCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};

  for (const l of leads) {
    const themes = l.interests?.length ? l.interests : l.interest ? [l.interest] : ["Other"];
    for (const t of themes) {
      interestCounts[t] = (interestCounts[t] ?? 0) + 1;
    }
    const day = l.capturedAtIso?.slice(0, 10) ?? "unknown";
    const label = day.includes("2026-08-13") ? "Day 1" : day.includes("2026-08-14") ? "Day 2" : l.capturedAt.split("·")[0]?.trim() || "Event";
    dayCounts[label] = (dayCounts[label] ?? 0) + 1;
  }

  const topInterest =
    Object.entries(interestCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const mostActiveDay =
    Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const byDay = Object.entries(dayCounts).map(([day, count]) => ({ day, leads: count }));

  return {
    total: leads.length,
    contacted: leads.filter((l) => l.status !== "None").length,
    converted: leads.filter((l) => l.status === "Converted").length,
    topInterest,
    mostActiveDay,
    byDay,
    leads,
  };
}

export function exportLeadsCsv(leads: ExhibitorLead[]) {
  const headers = [
    "Name",
    "Email",
    "Organization",
    "Title",
    "Country",
    "Phone",
    "Interests",
    "Booth notes",
    "Status",
    "Captured",
    "Method",
    "Ticket ID",
    "Consent",
  ];
  const rows = leads.map((l) =>
    [
      l.name,
      l.email,
      l.org,
      l.title,
      l.country,
      l.phone ?? "",
      (l.interests ?? []).join("; ") || l.interest,
      l.boothNotes ?? "",
      l.status,
      l.capturedAt,
      l.captureMethod,
      l.ticketId ?? "",
      l.consentGranted ? "yes" : "no",
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

/** Demo ticket IDs for prototype scanning */
export const DEMO_ATTENDEE_TICKETS = [
  { label: "Alice Uwimana (MINAGRI)", payload: "NAS26-R1-1000" },
  { label: "John Okello (Uganda)", payload: "NAS26-R2-1001" },
  { label: "Maria Bonomi (Italy)", payload: "NAS26-R3-1002" },
  { label: "Patrick Niyonzima (Farmer)", payload: "NAS26-R4-1003" },
  { label: "Marcus Weber (no exhibitor consent)", payload: "NAS26-R6-1005" },
];
