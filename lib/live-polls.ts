import type { MockSession, ParticipationKind, Role } from "./mock-data";
import {
  patchStore,
  uid,
  type AppStore,
  type LivePoll,
  type LivePollOption,
  type PollAudienceConfig,
  type PollVote,
  type StoreRegistration,
} from "./store";

export const VOTER_ROLES: Role[] = [
  "attendee",
  "speaker",
  "exhibitor",
  "moderator",
  "registration_desk",
];

export const TICKET_CATEGORY_OPTIONS = [
  { id: "intl", label: "International Delegate" },
  { id: "ngo", label: "NGO / CSO / Private Sector" },
  { id: "academic", label: "Academic / Researcher" },
  { id: "student", label: "Student" },
  { id: "farmer", label: "Farmer / Farmer Org." },
  { id: "virtual", label: "Virtual Attendee" },
  { id: "media", label: "Media / Press" },
];

export const PARTICIPATION_OPTIONS: { id: ParticipationKind; label: string }[] = [
  { id: "exhibitor", label: "Exhibitor only" },
  { id: "sponsor", label: "Sponsor only" },
  { id: "both", label: "Exhibitor + Sponsor" },
];

export function findRegistrationByEmail(store: AppStore, email: string): StoreRegistration | undefined {
  return store.registrations.find((r) => r.email.toLowerCase() === email.toLowerCase());
}

export function matchesAudience(
  session: MockSession,
  poll: LivePoll,
  registration?: StoreRegistration,
): boolean {
  const { audience } = poll;
  if (audience.roles.length > 0 && !audience.roles.includes(session.role)) return false;
  if (audience.ticketCategoryIds.length > 0) {
    const catId = registration?.categoryId ?? "";
    if (!audience.ticketCategoryIds.includes(catId)) return false;
  }
  if (audience.participationKinds.length > 0 && session.role === "exhibitor") {
    const p = session.participation ?? "exhibitor";
    if (!audience.participationKinds.includes(p)) return false;
  }
  return true;
}

export function canUserVotePoll(
  session: MockSession,
  poll: LivePoll,
  votes: PollVote[],
  registration?: StoreRegistration,
): boolean {
  if (poll.status !== "open") return false;
  if (!matchesAudience(session, poll, registration)) return false;
  return !hasUserVoted(poll.id, session.email, votes);
}

export function hasUserVoted(pollId: string, email: string, votes: PollVote[]): boolean {
  const key = email.toLowerCase();
  return votes.some((v) => v.pollId === pollId && v.voterEmail.toLowerCase() === key);
}

export function getUserVote(pollId: string, email: string, votes: PollVote[]): PollVote | undefined {
  const key = email.toLowerCase();
  return votes.find((v) => v.pollId === pollId && v.voterEmail.toLowerCase() === key);
}

export function canUserSeePoll(session: MockSession, poll: LivePoll, registration?: StoreRegistration): boolean {
  if (poll.status === "draft") return false;
  return matchesAudience(session, poll, registration);
}

export function canUserSeeResults(
  session: MockSession,
  poll: LivePoll,
  votes: PollVote[],
  registration?: StoreRegistration,
  isManager = false,
): boolean {
  if (isManager) return true;
  if (!poll.resultsVisible) return false;
  if (!canUserSeePoll(session, poll, registration)) return false;
  if (poll.status === "open" && !hasUserVoted(poll.id, session.email, votes)) return false;
  return poll.status === "closed" || poll.status === "open";
}

export type PollTally = {
  optionId: string;
  label: string;
  count: number;
  percent: number;
};

export function tallyPoll(poll: LivePoll, votes: PollVote[]): PollTally[] {
  const pollVotes = votes.filter((v) => v.pollId === poll.id);
  const total = pollVotes.length;
  return poll.options.map((o) => {
    const count = pollVotes.filter((v) => v.optionId === o.id).length;
    return {
      optionId: o.id,
      label: o.label,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

export function pollsForVoter(
  store: AppStore,
  session: MockSession,
): { active: LivePoll[]; past: LivePoll[] } {
  const reg = findRegistrationByEmail(store, session.email);
  const visible = store.livePolls.filter((p) => canUserSeePoll(session, p, reg));
  const active = visible.filter((p) => p.status === "open");
  const past = visible.filter((p) => p.status === "closed");
  return { active, past };
}

export function submitPollVote(
  session: MockSession,
  pollId: string,
  optionId: string,
): { ok: true } | { ok: false; error: string } {
  let err = "";
  patchStore((s) => {
    const poll = s.livePolls.find((p) => p.id === pollId);
    if (!poll) {
      err = "Poll not found";
      return s;
    }
    const reg = findRegistrationByEmail(s, session.email);
    if (!canUserVotePoll(session, poll, s.pollVotes, reg)) {
      err = "You cannot vote on this poll";
      return s;
    }
    if (!poll.options.some((o) => o.id === optionId)) {
      err = "Invalid option";
      return s;
    }
    const vote: PollVote = {
      id: uid("pv"),
      pollId,
      optionId,
      voterEmail: session.email,
      voterName: session.name,
      voterRole: session.role,
      votedAt: new Date().toISOString(),
    };
    return { ...s, pollVotes: [...s.pollVotes, vote] };
  });
  if (err) return { ok: false, error: err };
  return { ok: true };
}

export type CreatePollInput = {
  title: string;
  question: string;
  description?: string;
  options: string[];
  sessionId?: string;
  audience: PollAudienceConfig;
  createdBy: string;
};

export function createLivePoll(input: CreatePollInput): LivePoll {
  const poll: LivePoll = {
    id: uid("poll"),
    title: input.title.trim(),
    question: input.question.trim(),
    description: input.description?.trim() || undefined,
    sessionId: input.sessionId || undefined,
    options: input.options
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label) => ({ id: uid("po"), label })),
    audience: input.audience,
    status: "draft",
    resultsVisible: false,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
  patchStore((s) => ({ ...s, livePolls: [poll, ...s.livePolls] }));
  return poll;
}

export function updateLivePoll(pollId: string, patch: Partial<Omit<LivePoll, "id" | "createdAt" | "createdBy">>) {
  patchStore((s) => ({
    ...s,
    livePolls: s.livePolls.map((p) => (p.id === pollId ? { ...p, ...patch } : p)),
  }));
}

export function setPollStatus(pollId: string, status: LivePoll["status"]) {
  patchStore((s) => ({
    ...s,
    livePolls: s.livePolls.map((p) => {
      if (p.id !== pollId) return p;
      const now = new Date().toISOString();
      if (status === "open") return { ...p, status, openedAt: p.openedAt ?? now };
      if (status === "closed") return { ...p, status, closedAt: now };
      return { ...p, status };
    }),
  }));
}

export function togglePollResultsVisible(pollId: string, visible: boolean) {
  updateLivePoll(pollId, { resultsVisible: visible });
}

export function deleteLivePoll(pollId: string) {
  patchStore((s) => ({
    ...s,
    livePolls: s.livePolls.filter((p) => p.id !== pollId),
    pollVotes: s.pollVotes.filter((v) => v.pollId !== pollId),
  }));
}

export function audienceSummary(poll: LivePoll): string {
  const parts: string[] = [];
  if (poll.audience.roles.length === 0) parts.push("All roles");
  else parts.push(poll.audience.roles.map((r) => r.replace("_", " ")).join(", "));
  if (poll.audience.ticketCategoryIds.length > 0) {
    const labels = poll.audience.ticketCategoryIds
      .map((id) => TICKET_CATEGORY_OPTIONS.find((t) => t.id === id)?.label ?? id)
      .join(", ");
    parts.push(`Tickets: ${labels}`);
  }
  if (poll.audience.participationKinds.length > 0) {
    parts.push(`Exhibitor: ${poll.audience.participationKinds.join(", ")}`);
  }
  return parts.join(" · ");
}
