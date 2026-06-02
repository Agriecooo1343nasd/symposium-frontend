"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileViewerContent } from "@/components/file-viewer/FileViewerContent";
import { detectFileKind, fileKindLabel, loadFileViewerPayload } from "@/lib/file-viewer";

export default function FileViewPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading preview…</div>
      }
    >
      <FileViewPage />
    </Suspense>
  );
}

function FileViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [payload, setPayload] = useState<{ src: string; fileName: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    const data = loadFileViewerPayload(id);
    setPayload(data);
  }, [id]);

  useEffect(() => {
    if (!payload) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [payload]);

  const kind = payload ? detectFileKind(payload.fileName, payload.src) : null;

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-muted-foreground">No file specified.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-muted-foreground">This preview link has expired or the file is too large to open in a new tab.</p>
        <p className="text-xs text-muted-foreground">Open the file again from the portal using View.</p>
        <Button asChild variant="outline">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 bg-card">
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-base sm:text-lg font-bold truncate">{payload.fileName}</h1>
          <p className="text-[11px] text-muted-foreground">
            Read-only · {kind ? fileKindLabel(kind) : "File"}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()} aria-label="Close">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        <FileViewerContent src={payload.src} fileName={payload.fileName} className="h-full" />
      </div>
    </div>
  );
}
