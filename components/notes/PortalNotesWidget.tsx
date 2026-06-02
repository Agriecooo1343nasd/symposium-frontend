"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Maximize2, Minimize2, PenLine, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  addTab,
  getActiveTab,
  removeTab,
  renameTab,
  setActiveTab,
  updateTabHtml,
  type PortalNotesDocument,
} from "@/lib/portal-notes-document";
import {
  loadPortalNotesDocument,
  loadPortalNotesFullscreen,
  loadPortalNotesOpen,
  portalIdFromPathname,
  savePortalNotesDocument,
  savePortalNotesFullscreen,
  savePortalNotesOpen,
} from "@/lib/portal-notes-storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotesTabsBar } from "./NotesTabsBar";
import { useFileViewerOptional } from "@/components/file-viewer";

const RichNotesEditor = dynamic(
  () => import("./RichNotesEditor").then((m) => m.RichNotesEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading editor…</div>
    ),
  },
);

type PortalNotesContextValue = {
  open: boolean;
  fullscreen: boolean;
  toggle: () => void;
  close: () => void;
  toggleFullscreen: () => void;
};

const PortalNotesContext = createContext<PortalNotesContextValue | null>(null);

export function usePortalNotes() {
  return useContext(PortalNotesContext);
}

export function PortalNotesWidget({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const portalId = portalIdFromPathname(pathname);
  const { session } = useAuth();
  const userKey = (session?.email ?? "anonymous").toLowerCase();
  const fileViewer = useFileViewerOptional();

  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [doc, setDoc] = useState<PortalNotesDocument | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef("<p></p>");
  const activeTabIdRef = useRef("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const loaded = loadPortalNotesDocument(userKey, portalId);
    setDoc(loaded);
    activeTabIdRef.current = loaded.activeTabId;
    htmlRef.current = getActiveTab(loaded).html;
    setOpen(loadPortalNotesOpen(portalId));
    setFullscreen(loadPortalNotesFullscreen(portalId));
    setHydrated(true);
  }, [userKey, portalId]);

  const applyTabNavigation = useCallback(
    (updater: (d: PortalNotesDocument) => PortalNotesDocument) => {
      cancelPendingSave();
      setDoc((prev) => {
        if (!prev) return prev;
        const flushed = updateTabHtml(prev, activeTabIdRef.current, htmlRef.current);
        const next = updater(flushed);
        activeTabIdRef.current = next.activeTabId;
        htmlRef.current = getActiveTab(next).html;
        savePortalNotesDocument(userKey, portalId, next);
        return next;
      });
    },
    [userKey, portalId, cancelPendingSave],
  );

  const onHtmlChange = useCallback(
    (html: string) => {
      const tabId = activeTabIdRef.current;
      if (!tabId) return;
      htmlRef.current = html;
      setDoc((prev) => {
        if (!prev) return prev;
        return updateTabHtml(prev, tabId, html);
      });
      cancelPendingSave();
      saveTimer.current = setTimeout(() => {
        setDoc((prev) => {
          if (!prev || activeTabIdRef.current !== tabId) return prev;
          const next = updateTabHtml(prev, tabId, htmlRef.current);
          savePortalNotesDocument(userKey, portalId, next);
          return next;
        });
      }, 350);
    },
    [userKey, portalId, cancelPendingSave],
  );

  const selectTab = useCallback(
    (tabId: string) => {
      if (tabId === activeTabIdRef.current) return;
      applyTabNavigation((d) => setActiveTab(d, tabId));
    },
    [applyTabNavigation],
  );

  const handleAddTab = useCallback(() => {
    applyTabNavigation((d) => addTab(d));
  }, [applyTabNavigation]);

  const handleRemoveTab = useCallback(
    (tabId: string) => {
      applyTabNavigation((d) => removeTab(d, tabId));
    },
    [applyTabNavigation],
  );

  const handleRenameTab = useCallback(
    (tabId: string, name: string) => {
      setDoc((prev) => {
        if (!prev) return prev;
        const next = renameTab(prev, tabId, name);
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => savePortalNotesDocument(userKey, portalId, next), 350);
        return next;
      });
    },
    [userKey, portalId],
  );

  const setOpenPersisted = useCallback(
    (next: boolean) => {
      setOpen(next);
      savePortalNotesOpen(portalId, next);
      if (!next) {
        setFullscreen(false);
        savePortalNotesFullscreen(portalId, false);
      }
    },
    [portalId],
  );

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      savePortalNotesOpen(portalId, next);
      if (!next) {
        setFullscreen(false);
        savePortalNotesFullscreen(portalId, false);
      }
      return next;
    });
  }, [portalId]);

  const close = useCallback(() => {
    cancelPendingSave();
    if (doc && activeTabIdRef.current) {
      const next = updateTabHtml(doc, activeTabIdRef.current, htmlRef.current);
      savePortalNotesDocument(userKey, portalId, next);
      setDoc(next);
    }
    setOpenPersisted(false);
  }, [doc, userKey, portalId, setOpenPersisted, cancelPendingSave]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((prev) => {
      const next = !prev;
      savePortalNotesFullscreen(portalId, next);
      return next;
    });
  }, [portalId]);

  useEffect(() => {
    if (!fullscreen || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreen(false);
        savePortalNotesFullscreen(portalId, false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, open, portalId]);

  const ctx = useMemo(
    () => ({ open, fullscreen, toggle, close, toggleFullscreen }),
    [open, fullscreen, toggle, close, toggleFullscreen],
  );

  const activeTab = doc ? getActiveTab(doc) : null;
  const exportFileName = `NAS-notes-${portalId}-${activeTab?.name.replace(/\s+/g, "-") ?? "tab"}.pdf`;
  const panelVisible = open;
  const fileViewerOpen = !!fileViewer?.active;

  const panelZ = fullscreen ? "z-[460]" : fileViewerOpen ? "z-[430]" : "z-[55]";

  return (
    <PortalNotesContext.Provider value={ctx}>
      {children}

      {/* Pen always visible — above file viewer (400) and notes panel */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close notes" : "Open notes"}
        className={cn(
          "fixed bottom-6 right-6 z-[450] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          "gradient-navy text-white hover:scale-105 active:scale-95",
          open && "ring-2 ring-accent ring-offset-2 ring-offset-background",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <PenLine className="h-6 w-6" />}
      </button>

      <div
        role="dialog"
        aria-label="Symposium notes"
        aria-hidden={!panelVisible}
        className={cn(
          "fixed flex flex-col bg-card shadow-2xl transition-all duration-300",
          panelZ,
          fullscreen
            ? "inset-0 rounded-none border-0"
            : cn(
                "rounded-2xl border border-border",
                fileViewerOpen
                  ? "bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-[min(520px,calc(100vw-3rem))]"
                  : "bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[min(560px,calc(100vw-3rem))]",
                "h-[min(72vh,680px)]",
                panelVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none",
              ),
          fullscreen && panelVisible && "opacity-100 pointer-events-auto",
          fullscreen && !panelVisible && "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0 gap-2">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold leading-tight truncate">My notes</h2>
            <p className="text-[11px] text-muted-foreground">
              Tabs per session · resize images · tables · lists · Ctrl+Z undo
              {fileViewerOpen ? " · reading alongside document" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={close} aria-label="Close notes">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hydrated && doc && activeTab ? (
          <>
            <NotesTabsBar
              document={doc}
              onSelectTab={selectTab}
              onAddTab={handleAddTab}
              onRemoveTab={handleRemoveTab}
              onRenameTab={handleRenameTab}
            />
            <RichNotesEditor
              key={activeTab.id}
              editorKey={activeTab.id}
              initialHtml={activeTab.html}
              onHtmlChange={onHtmlChange}
              exportFileName={exportFileName}
              contentRef={contentRef}
              isFullscreen={fullscreen}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</div>
        )}
      </div>
    </PortalNotesContext.Provider>
  );
}
