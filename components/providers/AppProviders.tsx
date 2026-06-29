"use client";

import { FileViewerProvider } from "@/components/file-viewer";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <QueryProvider>
        <FileViewerProvider>
          {children}
          <Toaster richColors position="top-right" />
        </FileViewerProvider>
      </QueryProvider>
    </StoreProvider>
  );
}
