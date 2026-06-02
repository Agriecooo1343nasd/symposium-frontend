"use client";

import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { renderAsync } from "docx-preview";
import { init as initPptxPreview } from "pptx-preview";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  detectFileKind,
  fetchFileArrayBuffer,
  fetchFileText,
  fileKindLabel,
  type FileViewerKind,
} from "@/lib/file-viewer";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  fileName: string;
  className?: string;
};

export function FileViewerContent({ src, fileName, className }: Props) {
  const kind = detectFileKind(fileName, src);

  if (kind === "image") {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-black/5 p-4", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={fileName} className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-black p-4", className)}>
        <video src={src} controls playsInline className="max-h-full max-w-full rounded-lg" />
      </div>
    );
  }

  if (kind === "audio") {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center gap-4 p-8", className)}>
        <p className="text-sm font-medium text-muted-foreground">{fileName}</p>
        <audio src={src} controls className="w-full max-w-lg" />
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div className={cn("h-full w-full bg-secondary/30", className)}>
        <iframe title={fileName} src={src} className="h-full w-full border-0" />
      </div>
    );
  }

  if (kind === "text") {
    return <TextFileViewer src={src} fileName={fileName} className={className} />;
  }

  if (kind === "csv") {
    return <CsvFileViewer src={src} fileName={fileName} className={className} />;
  }

  if (kind === "spreadsheet") {
    return <SpreadsheetFileViewer src={src} fileName={fileName} className={className} />;
  }

  if (kind === "word") {
    return <WordFileViewer src={src} fileName={fileName} className={className} />;
  }

  if (kind === "presentation") {
    return <PresentationFileViewer src={src} fileName={fileName} className={className} />;
  }

  return <UnsupportedViewer fileName={fileName} kind={kind} src={src} className={className} />;
}

function ViewerShell({
  children,
  loading,
  error,
  className,
}: {
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
}) {
  if (error) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center gap-3 p-8 text-center", className)}>
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }
  return (
    <div className={cn("relative h-full w-full min-h-0", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}
      {children}
    </div>
  );
}

function TextFileViewer({ src, fileName, className }: { src: string; fileName: string; className?: string }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFileText(src)
      .then((t) => {
        if (!cancelled) setText(t);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load text");
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <ViewerShell loading={!text && !error} error={error} className={className}>
      <pre className="h-full overflow-auto p-6 text-sm font-mono whitespace-pre-wrap break-words bg-card">{text}</pre>
    </ViewerShell>
  );
}

function CsvFileViewer({ src, className }: { src: string; fileName: string; className?: string }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFileText(src)
      .then((raw) => {
        if (cancelled) return;
        const parsed = Papa.parse<string[]>(raw, { skipEmptyLines: true });
        if (parsed.errors.length && !parsed.data.length) {
          setError(parsed.errors[0]?.message ?? "Could not parse CSV");
          return;
        }
        setRows(parsed.data as string[][]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load CSV"));
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (error) return <ViewerShell error={error} className={className} />;
  if (!rows?.length) {
    return <ViewerShell loading className={className} />;
  }

  const header = rows[0] ?? [];
  const body = rows.slice(1);

  return (
    <div className={cn("h-full overflow-auto p-4", className)}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 sticky top-0">
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold border-b border-border whitespace-nowrap">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className="border-b border-border/60 hover:bg-secondary/20">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 whitespace-nowrap max-w-xs truncate" title={cell}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpreadsheetFileViewer({ src, className }: { src: string; fileName: string; className?: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFileArrayBuffer(src)
      .then((buf) => {
        if (cancelled) return;
        const wb = XLSX.read(buf, { type: "array" });
        const first = wb.SheetNames[0];
        if (!first) {
          setError("Spreadsheet has no sheets");
          return;
        }
        const sheet = wb.Sheets[first];
        if (!sheet) {
          setError("Could not read sheet");
          return;
        }
        setHtml(XLSX.utils.sheet_to_html(sheet, { id: "nas-sheet-table", editable: false }));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load spreadsheet"));
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (error) return <ViewerShell error={error} className={className} />;
  if (!html) return <ViewerShell loading className={className} />;

  return (
    <div
      className={cn("file-viewer-sheet h-full overflow-auto p-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:bg-secondary/60 [&_th]:px-2 [&_th]:py-1", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function WordFileViewer({ src, className }: { src: string; fileName: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current) return;

    fetchFileArrayBuffer(src)
      .then(async (buf) => {
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        await renderAsync(buf, containerRef.current, undefined, {
          className: "docx-preview-wrapper",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
        });
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to render Word document");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <ViewerShell loading={loading} error={error} className={className}>
      <div className={cn("h-full overflow-auto bg-white p-4", className)}>
        <div ref={containerRef} className="docx-preview-container mx-auto max-w-4xl" />
      </div>
    </ViewerShell>
  );
}

function PresentationFileViewer({ src, fileName, className }: { src: string; fileName: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ext = fileName.split(".").pop()?.toLowerCase();
  const [error, setError] = useState<string | null>(
    ext === "ppt" ? "Legacy .ppt files cannot be previewed in the browser. Ask the organizer for a .pptx copy." : null,
  );
  const [loading, setLoading] = useState(ext !== "ppt");

  useEffect(() => {
    if (ext === "ppt") return;

    let cancelled = false;
    let previewer: ReturnType<typeof initPptxPreview> | null = null;

    fetchFileArrayBuffer(src)
      .then(async (buf) => {
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        previewer = initPptxPreview(containerRef.current, {
          width: Math.min(containerRef.current.clientWidth || 960, 1100),
          height: 620,
        });
        await previewer.preview(buf);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to render presentation");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (previewer && "destroy" in previewer && typeof previewer.destroy === "function") {
        previewer.destroy();
      }
    };
  }, [src, ext]);

  return (
    <ViewerShell loading={loading} error={error} className={className}>
      <div className={cn("h-full overflow-auto bg-secondary/20 p-4", className)}>
        <div ref={containerRef} className="mx-auto min-h-[400px]" />
      </div>
    </ViewerShell>
  );
}

function UnsupportedViewer({
  fileName,
  kind,
  src,
  className,
}: {
  fileName: string;
  kind: FileViewerKind;
  src: string;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-4 p-8 text-center", className)}>
      <AlertCircle className="h-10 w-10 text-muted-foreground" />
      <div>
        <p className="font-medium">{fileName}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {fileKindLabel(kind)} preview is not available in the browser for this format.
        </p>
      </div>
      <p className="text-xs text-muted-foreground max-w-sm">
        Read-only viewing supports images, video, audio, PDF, CSV, Excel, Word (.docx), and PowerPoint (.pptx).
      </p>
      {src.startsWith("http") && (
        <a href={src} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
          Open original link in new tab
        </a>
      )}
    </div>
  );
}
