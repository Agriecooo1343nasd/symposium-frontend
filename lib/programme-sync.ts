import type { Session } from "./mock-data";
import { patchStore, uid, type RunOfShowItem, type AppStore } from "./store";

export function syncRunOfShowFromSession(session: Session): RunOfShowItem {
  return {
    id: `ros-${session.id}`,
    day: session.day,
    order: 0,
    title: session.title,
    startTime: session.start,
    endTime: session.end,
    type: "session",
    sessionId: session.id,
    status: "upcoming",
  };
}

export function upsertSession(session: Session, store?: AppStore): AppStore {
  let result!: AppStore;
  patchStore((s) => {
    const exists = s.sessions.some((x) => x.id === session.id);
    const sessions = exists
      ? s.sessions.map((x) => (x.id === session.id ? session : x))
      : [...s.sessions, session];

    let runOfShow = [...s.runOfShow];
    const rosId = `ros-${session.id}`;
    const existingRos = runOfShow.find((r) => r.sessionId === session.id || r.id === rosId);

    if (existingRos) {
      runOfShow = runOfShow.map((r) =>
        r.sessionId === session.id || r.id === rosId
          ? {
              ...r,
              title: session.title,
              startTime: session.start,
              endTime: session.end,
              day: session.day,
            }
          : r,
      );
    } else {
      const dayItems = runOfShow.filter((r) => r.day === session.day);
      const maxOrder = dayItems.reduce((m, r) => Math.max(m, r.order), 0);
      runOfShow.push({ ...syncRunOfShowFromSession(session), order: maxOrder + 1 });
    }

    result = { ...s, sessions, runOfShow };
    return result;
  });
  return result;
}

export function deleteSession(sessionId: string) {
  patchStore((s) => ({
    ...s,
    sessions: s.sessions.filter((x) => x.id !== sessionId),
    runOfShow: s.runOfShow.filter((r) => r.sessionId !== sessionId && r.id !== `ros-${sessionId}`),
    sessionMaterials: s.sessionMaterials.filter((m) => m.sessionId !== sessionId),
  }));
}

export function upsertRunOfShowItem(item: RunOfShowItem) {
  patchStore((s) => {
    const exists = s.runOfShow.some((r) => r.id === item.id);
    const runOfShow = exists
      ? s.runOfShow.map((r) => (r.id === item.id ? item : r))
      : [...s.runOfShow, item];
    return { ...s, runOfShow };
  });
}

export function deleteRunOfShowItem(id: string) {
  patchStore((s) => ({ ...s, runOfShow: s.runOfShow.filter((r) => r.id !== id) }));
}

export function reorderRunOfShow(day: 1 | 2, orderedIds: string[]) {
  patchStore((s) => {
    const others = s.runOfShow.filter((r) => r.day !== day);
    const dayItems = orderedIds
      .map((id, i) => {
        const item = s.runOfShow.find((r) => r.id === id);
        return item ? { ...item, order: i + 1 } : null;
      })
      .filter(Boolean) as RunOfShowItem[];
    return { ...s, runOfShow: [...others, ...dayItems] };
  });
}

export function setRunOfShowStatus(id: string, status: RunOfShowItem["status"]) {
  patchStore((s) => ({
    ...s,
    runOfShow: s.runOfShow.map((r) => {
      if (r.id === id) return { ...r, status };
      if (status === "live" && r.status === "live") return { ...r, status: "upcoming" as const };
      return r;
    }),
  }));
}

export function createBreakOrCustom(
  partial: Pick<RunOfShowItem, "day" | "title" | "startTime" | "endTime" | "type" | "notes" | "ownerName" | "ownerEmail" | "sessionId">,
) {
  const id = uid("ros");
  patchStore((s) => {
    const dayItems = s.runOfShow.filter((r) => r.day === partial.day);
    const maxOrder = dayItems.reduce((m, r) => Math.max(m, r.order), 0);
    const item: RunOfShowItem = {
      id,
      day: partial.day,
      order: maxOrder + 1,
      title: partial.title,
      startTime: partial.startTime,
      endTime: partial.endTime,
      type: partial.type,
      sessionId: partial.sessionId,
      status: "upcoming",
      notes: partial.notes,
      ownerName: partial.ownerName,
      ownerEmail: partial.ownerEmail,
    };
    return { ...s, runOfShow: [...s.runOfShow, item] };
  });
  return id;
}
