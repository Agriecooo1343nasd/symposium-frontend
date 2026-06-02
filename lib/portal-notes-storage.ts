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

import {
  createDefaultDocument,
  getActiveTab,
  parsePortalNotesDocument,
  serializePortalNotesDocument,
  updateActiveTabHtml,
  type PortalNotesDocument,
} from "./portal-notes-document";

export function loadPortalNotesDocument(userKey: string, portalId: string): PortalNotesDocument {
  if (typeof window === "undefined") return createDefaultDocument();
  try {
    const raw = localStorage.getItem(notesStorageKey(userKey, portalId));
    return parsePortalNotesDocument(raw);
  } catch {
    return createDefaultDocument();
  }
}

export function savePortalNotesDocument(userKey: string, portalId: string, doc: PortalNotesDocument) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(notesStorageKey(userKey, portalId), serializePortalNotesDocument(doc));
  } catch {
    /* quota exceeded */
  }
}

export function loadPortalNotesHtml(userKey: string, portalId: string): string {
  return getActiveTab(loadPortalNotesDocument(userKey, portalId)).html;
}

export function savePortalNotesHtml(userKey: string, portalId: string, html: string) {
  const doc = loadPortalNotesDocument(userKey, portalId);
  savePortalNotesDocument(userKey, portalId, updateActiveTabHtml(doc, html));
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
