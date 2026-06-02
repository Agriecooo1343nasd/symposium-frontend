import type { FileViewerPayload } from "./types";

const PREFIX = "nas-file-viewer:";

export function stashFileViewerPayload(payload: FileViewerPayload): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  if (typeof window === "undefined") return id;
  try {
    sessionStorage.setItem(`${PREFIX}${id}`, JSON.stringify(payload));
  } catch {
    /* payload too large — caller should use modal only */
  }
  return id;
}

export function loadFileViewerPayload(id: string): FileViewerPayload | null {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as FileViewerPayload;
  } catch {
    return null;
  }
}
