"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectFileKind, fileKindLabel, stashFileViewerPayload, type FileViewerPayload } from "@/lib/file-viewer";
import { FileViewerContent } from "./FileViewerContent";

type FileViewerContextValue = {
  openFile: (payload: FileViewerPayload) => void;
  openFileFullPage: (payload: FileViewerPayload) => void;
  close: () => void;
  active: FileViewerPayload | null;
};

const FileViewerContext = createContext<FileViewerContextValue | null>(null);

export function useFileViewer() {
  const ctx = useContext(FileViewerContext);
  if (!ctx) {
    throw new Error("useFileViewer must be used within FileViewerProvider");
  }
  return ctx;
}

/** Safe hook when provider may be absent (returns no-op open). */
export function useFileViewerOptional() {
  return useContext(FileViewerContext);
}

export function FileViewerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [active, setActive] = useState<FileViewerPayload | null>(null);

  const close = useCallback(() => setActive(null), []);

  const openFile = useCallback((payload: FileViewerPayload) => {
    if (!payload.src?.trim()) return;
    setActive({
      src: payload.src,
      fileName: payload.fileName || "document",
    });
  }, []);

  const openFileFullPage = useCallback(
    (payload: FileViewerPayload) => {
      if (!payload.src?.trim()) return;
      try {
        const id = stashFileViewerPayload({
          src: payload.src,
          fileName: payload.fileName || "document",
        });
        router.push(`/view?id=${encodeURIComponent(id)}`);
      } catch {
        openFile(payload);
      }
    },
    [router, openFile],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close]);

  const kind = active ? detectFileKind(active.fileName, active.src) : null;

  return (
    <FileViewerContext.Provider value={{ openFile, openFileFullPage, close, active }}>
      {children}

      {active && (
        <div
          className="fixed inset-0 z-[400] flex flex-col bg-background"
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${active.fileName}`}
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 bg-card">
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-base sm:text-lg font-bold truncate">{active.fileName}</h1>
              <p className="text-[11px] text-muted-foreground">
                Read-only · {kind ? fileKindLabel(kind) : "File"} · NAS 2026
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex gap-1 text-xs"
                onClick={() => openFileFullPage(active)}
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Full page
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={close} aria-label="Close viewer">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-hidden">
            <FileViewerContent src={active.src} fileName={active.fileName} className="h-full" />
          </div>

          <footer className="shrink-0 border-t border-border px-4 py-2 text-[10px] text-muted-foreground text-center sm:text-left">
            Preview only — editing is disabled. Press Esc to close.
          </footer>
        </div>
      )}
    </FileViewerContext.Provider>
  );
}
