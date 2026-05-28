import { loadStore, patchStore, uid, getThreadId, type AttendeeProfile, type SubTheme } from "./store";
import { SUB_THEMES } from "./mock-data";

export function getProfile(email: string) {
  return loadStore().attendeeProfiles.find((p) => p.email === email);
}

export function getPublicDirectory(filters?: { q?: string; country?: string; subTheme?: string }) {
  const me = filters?.q;
  return loadStore().attendeeProfiles.filter((p) => {
    if (!p.publicInDirectory) return false;
    if (filters?.country && filters.country !== "All" && p.country !== filters.country) return false;
    if (filters?.subTheme && filters.subTheme !== "All" && !p.subThemeInterests.includes(filters.subTheme as SubTheme)) return false;
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      if (![p.name, p.org, p.country, p.title, p.bio].some((f) => f?.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

export function getConnectionsFor(email: string) {
  const store = loadStore();
  return store.connectionRequests
    .filter((r) => r.status === "accepted" && (r.fromEmail === email || r.toEmail === email))
    .map((r) => {
      const other = r.fromEmail === email ? { email: r.toEmail, name: r.toName } : { email: r.fromEmail, name: r.fromName };
      const profile = store.attendeeProfiles.find((p) => p.email === other.email);
      return { ...other, profile, requestId: r.id };
    });
}

export function sendConnectionRequest(from: { email: string; name: string }, to: { email: string; name: string }, message: string) {
  if (from.email === to.email) return { ok: false as const, error: "Cannot connect with yourself" };
  const store = loadStore();
  const existing = store.connectionRequests.find(
    (r) =>
      (r.fromEmail === from.email && r.toEmail === to.email) ||
      (r.fromEmail === to.email && r.toEmail === from.email),
  );
  if (existing?.status === "accepted") return { ok: false as const, error: "Already connected" };
  if (existing?.status === "pending") return { ok: false as const, error: "Request already pending" };

  patchStore((s) => ({
    ...s,
    connectionRequests: [
      {
        id: uid("cr"),
        fromEmail: from.email,
        fromName: from.name,
        toEmail: to.email,
        toName: to.name,
        message,
        status: "pending",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...s.connectionRequests.filter((r) => r.id !== existing?.id),
    ],
  }));
  return { ok: true as const };
}

export function respondConnectionRequest(id: string, accept: boolean) {
  patchStore((s) => ({
    ...s,
    connectionRequests: s.connectionRequests.map((r) =>
      r.id === id ? { ...r, status: accept ? "accepted" : "declined" } : r,
    ),
  }));
}

export function canMessage(emailA: string, emailB: string) {
  const a = getProfile(emailA);
  const b = getProfile(emailB);
  if (!a?.allowMessages || !b?.allowMessages) return false;
  const connected = loadStore().connectionRequests.some(
    (r) =>
      r.status === "accepted" &&
      ((r.fromEmail === emailA && r.toEmail === emailB) || (r.fromEmail === emailB && r.toEmail === emailA)),
  );
  return connected;
}

export function getThreadMessages(emailA: string, emailB: string) {
  const threadId = getThreadId(emailA, emailB);
  return loadStore()
    .chatMessages.filter((m) => m.threadId === threadId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

export function formatChatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formatChatDayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export type ConversationSummary = {
  email: string;
  name: string;
  profile?: ReturnType<typeof getProfile>;
  lastMessage?: { body?: string; fromEmail: string; sentAt: string };
  unreadCount: number;
};

export function getConversationSummaries(userEmail: string): ConversationSummary[] {
  const connections = getConnectionsFor(userEmail);
  return connections
    .map((c) => {
      const msgs = getThreadMessages(userEmail, c.email);
      const last = msgs[msgs.length - 1];
      return {
        email: c.email,
        name: c.name,
        profile: c.profile,
        lastMessage: last
          ? { body: last.body, fromEmail: last.fromEmail, sentAt: last.sentAt }
          : undefined,
        unreadCount: last && last.fromEmail !== userEmail ? 1 : 0,
      };
    })
    .sort((a, b) => (b.lastMessage?.sentAt ?? "").localeCompare(a.lastMessage?.sentAt ?? ""));
}

export function sendChatMessage(params: {
  from: { email: string; name: string };
  toEmail: string;
  body?: string;
  imageDataUrl?: string;
  fileName?: string;
}) {
  if (!canMessage(params.from.email, params.toEmail)) {
    return { ok: false as const, error: "Messaging only available between connected attendees who allow messages" };
  }
  if (!params.body?.trim() && !params.imageDataUrl) {
    return { ok: false as const, error: "Message or image required" };
  }
  const threadId = getThreadId(params.from.email, params.toEmail);
  patchStore((s) => ({
    ...s,
    chatMessages: [
      ...s.chatMessages,
      {
        id: uid("msg"),
        threadId,
        fromEmail: params.from.email,
        fromName: params.from.name,
        body: params.body?.trim(),
        imageDataUrl: params.imageDataUrl,
        fileName: params.fileName,
        sentAt: new Date().toISOString(),
      },
    ],
  }));
  return { ok: true as const };
}

export { SUB_THEMES };
