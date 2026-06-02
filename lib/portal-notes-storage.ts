const NOTES_PREFIX = "nas-portal-notes";
const OPEN_PREFIX = "nas-portal-notes-open";
const FULLSCREEN_PREFIX = "nas-portal-notes-fullscreen";

export function notesStorageKey(userKey: string, portalId: string) {
  return `${NOTES_PREFIX}:${userKey}:${portalId}`;
}

export function notesOpenStorageKey(portalId: string) {
  return `${OPEN_PREFIX}:${portalId}`;
}

export function notesFullscreenStorageKey(portalId: string) {
  return `${FULLSCREEN_PREFIX}:${portalId}`;
}

export function loadPortalNotesHtml(userKey: string, portalId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(notesStorageKey(userKey, portalId)) ?? "";
  } catch {
    return "";
  }
}

export function savePortalNotesHtml(userKey: string, portalId: string, html: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(notesStorageKey(userKey, portalId), html);
  } catch {
    /* quota exceeded — ignore */
  }
}

export function loadPortalNotesOpen(portalId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(notesOpenStorageKey(portalId)) === "1";
  } catch {
    return false;
  }
}

export function savePortalNotesOpen(portalId: string, open: boolean) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(notesOpenStorageKey(portalId), open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function loadPortalNotesFullscreen(portalId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(notesFullscreenStorageKey(portalId)) === "1";
  } catch {
    return false;
  }
}

export function savePortalNotesFullscreen(portalId: string, fullscreen: boolean) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(notesFullscreenStorageKey(portalId), fullscreen ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** First path segment: dashboard, admin, desk, exhibitor, speaker, moderator */
export function portalIdFromPathname(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg || "portal";
}
