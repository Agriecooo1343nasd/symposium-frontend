"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Maximize2, Minimize2, PenLine, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  loadPortalNotesFullscreen,
  loadPortalNotesHtml,
  loadPortalNotesOpen,
  portalIdFromPathname,
  savePortalNotesFullscreen,
  savePortalNotesHtml,
  savePortalNotesOpen,
} from "@/lib/portal-notes-storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

function useDebouncedSave(userKey: string, portalId: string) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (html: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        savePortalNotesHtml(userKey, portalId, html);
      }, 350);
    },
    [userKey, portalId],
  );
}

export function PortalNotesWidget({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const portalId = portalIdFromPathname(pathname);
  const { session } = useAuth();
  const userKey = (session?.email ?? "anonymous").toLowerCase();

  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [initialHtml, setInitialHtml] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const debouncedSave = useDebouncedSave(userKey, portalId);

  useEffect(() => {
    setInitialHtml(loadPortalNotesHtml(userKey, portalId));
    setOpen(loadPortalNotesOpen(portalId));
    setFullscreen(loadPortalNotesFullscreen(portalId));
    setHydrated(true);
  }, [userKey, portalId]);

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

  const close = useCallback(() => setOpenPersisted(false), [setOpenPersisted]);

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

  const exportFileName = `NAS-notes-${portalId}-${new Date().toISOString().slice(0, 10)}.pdf`;

  const panelVisible = open;

  return (
    <PortalNotesContext.Provider value={ctx}>
      {children}

      {/* Floating pen — hidden in fullscreen so it does not cover the editor */}
      {!fullscreen && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={open ? "Close notes" : "Open notes"}
          className={cn(
            "fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
            "gradient-navy text-white hover:scale-105 active:scale-95",
            open && "ring-2 ring-accent ring-offset-2 ring-offset-background",
          )}
        >
          {open ? <X className="h-6 w-6" /> : <PenLine className="h-6 w-6" />}
        </button>
      )}

      {/* Writer panel — stays mounted; fullscreen uses entire viewport */}
      <div
        role="dialog"
        aria-label="Symposium notes"
        aria-hidden={!panelVisible}
        className={cn(
          "fixed flex flex-col bg-card shadow-2xl transition-all duration-300",
          fullscreen
            ? "inset-0 z-[100] rounded-none border-0"
            : cn(
                "z-[55] rounded-2xl border border-border",
                "bottom-24 right-4 sm:right-6",
                "w-[calc(100vw-2rem)] sm:w-[min(560px,calc(100vw-3rem))]",
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
              Auto-saved · photos & videos · export PDF
              {fullscreen ? " · full screen" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              title={fullscreen ? "Exit full screen" : "Full screen"}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={close} aria-label="Close notes">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hydrated ? (
          <RichNotesEditor
            key={`${userKey}:${portalId}`}
            initialHtml={initialHtml}
            onHtmlChange={debouncedSave}
            exportFileName={exportFileName}
            contentRef={contentRef}
            isFullscreen={fullscreen}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</div>
        )}
      </div>
    </PortalNotesContext.Provider>
  );
}
