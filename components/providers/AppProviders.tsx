"use client";

import { FileViewerProvider } from "@/components/file-viewer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <FileViewerProvider>{children}</FileViewerProvider>;
}
