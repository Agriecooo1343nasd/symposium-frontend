export type NotesTab = {
  id: string;
  name: string;
  html: string;
};

export type PortalNotesDocument = {
  version: 1;
  tabs: NotesTab[];
  activeTabId: string;
};

const DOC_VERSION = 1;

function newTabId() {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createDefaultDocument(): PortalNotesDocument {
  const id = newTabId();
  return {
    version: DOC_VERSION,
    tabs: [{ id, name: "Session 1", html: "<p></p>" }],
    activeTabId: id,
  };
}

export function createNotesTab(name: string, html = "<p></p>"): NotesTab {
  return { id: newTabId(), name, html };
}

export function parsePortalNotesDocument(raw: string | null): PortalNotesDocument {
  if (!raw?.trim()) return createDefaultDocument();
  try {
    const parsed = JSON.parse(raw) as PortalNotesDocument;
    if (parsed?.version === 1 && Array.isArray(parsed.tabs) && parsed.tabs.length > 0 && parsed.activeTabId) {
      const activeExists = parsed.tabs.some((t) => t.id === parsed.activeTabId);
      return {
        ...parsed,
        activeTabId: activeExists ? parsed.activeTabId : parsed.tabs[0]!.id,
      };
    }
  } catch {
    /* legacy plain HTML */
  }
  const id = newTabId();
  return {
    version: DOC_VERSION,
    tabs: [{ id, name: "General", html: raw }],
    activeTabId: id,
  };
}

export function serializePortalNotesDocument(doc: PortalNotesDocument): string {
  return JSON.stringify(doc);
}

export function getActiveTab(doc: PortalNotesDocument): NotesTab {
  return doc.tabs.find((t) => t.id === doc.activeTabId) ?? doc.tabs[0]!;
}

export function updateActiveTabHtml(doc: PortalNotesDocument, html: string): PortalNotesDocument {
  return updateTabHtml(doc, doc.activeTabId, html);
}

export function updateTabHtml(doc: PortalNotesDocument, tabId: string, html: string): PortalNotesDocument {
  return {
    ...doc,
    tabs: doc.tabs.map((t) => (t.id === tabId ? { ...t, html } : t)),
  };
}

export function renameTab(doc: PortalNotesDocument, tabId: string, name: string): PortalNotesDocument {
  return {
    ...doc,
    tabs: doc.tabs.map((t) => (t.id === tabId ? { ...t, name: name.trim() || t.name } : t)),
  };
}

export function addTab(doc: PortalNotesDocument, name?: string): PortalNotesDocument {
  const tab = createNotesTab(name ?? `Session ${doc.tabs.length + 1}`);
  return {
    ...doc,
    tabs: [...doc.tabs, tab],
    activeTabId: tab.id,
  };
}

export function removeTab(doc: PortalNotesDocument, tabId: string): PortalNotesDocument {
  if (doc.tabs.length <= 1) return doc;
  const tabs = doc.tabs.filter((t) => t.id !== tabId);
  const activeTabId = doc.activeTabId === tabId ? tabs[0]!.id : doc.activeTabId;
  return { ...doc, tabs, activeTabId };
}

export function setActiveTab(doc: PortalNotesDocument, tabId: string): PortalNotesDocument {
  if (!doc.tabs.some((t) => t.id === tabId)) return doc;
  return { ...doc, activeTabId: tabId };
}
