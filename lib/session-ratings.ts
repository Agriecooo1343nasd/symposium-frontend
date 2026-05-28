import { loadStore, patchStore, uid, type SessionRating } from "./store";
import type { Session } from "./mock-data";

export type { SessionRating };

/** Session ended when run-of-show marks it done, or demo fallback list. */
export function isSessionEnded(sessionId: string): boolean {
  const ros = loadStore().runOfShow.find((r) => r.sessionId === sessionId);
  if (ros?.status === "done") return true;
  const DEMO_ENDED = ["ss1", "ss2", "ss3", "ss4", "ss5"];
  return DEMO_ENDED.includes(sessionId);
}

export function getSessionRating(sessionId: string, attendeeEmail: string) {
  return loadStore().sessionRatings.find(
    (r) => r.sessionId === sessionId && r.attendeeEmail === attendeeEmail,
  );
}

export function getSessionRatingSummary(sessionId: string) {
  const ratings = loadStore().sessionRatings.filter((r) => r.sessionId === sessionId);
  if (ratings.length === 0) return { count: 0, average: 0 };
  const average = ratings.reduce((a, r) => a + r.stars, 0) / ratings.length;
  return { count: ratings.length, average: Math.round(average * 10) / 10 };
}

export function submitSessionRating(params: {
  session: Pick<Session, "id" | "title">;
  attendeeEmail: string;
  attendeeName: string;
  stars: number;
  comment?: string;
}) {
  if (!isSessionEnded(params.session.id)) {
    return { ok: false as const, error: "Ratings open after the session ends" };
  }
  if (params.stars < 1 || params.stars > 5) {
    return { ok: false as const, error: "Please select a rating from 1 to 5 stars" };
  }
  const existing = getSessionRating(params.session.id, params.attendeeEmail);
  const entry: SessionRating = {
    id: existing?.id ?? uid("sr"),
    sessionId: params.session.id,
    attendeeEmail: params.attendeeEmail,
    attendeeName: params.attendeeName,
    stars: params.stars,
    comment: params.comment?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  };
  patchStore((s) => ({
    ...s,
    sessionRatings: [
      ...s.sessionRatings.filter(
        (r) => !(r.sessionId === params.session.id && r.attendeeEmail === params.attendeeEmail),
      ),
      entry,
    ],
  }));
  return { ok: true as const };
}
