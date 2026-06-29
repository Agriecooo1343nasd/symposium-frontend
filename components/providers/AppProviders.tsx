"use client";

import { FileViewerProvider } from "@/components/file-viewer";
import { AuthHydrator } from "@/components/providers/AuthHydrator";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { SymposiumProvider } from "@/components/providers/SymposiumProvider";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <QueryProvider>
        <AuthHydrator />
        <SymposiumProvider>
          <FileViewerProvider>
            {children}
            <Toaster richColors position="top-right" />
          </FileViewerProvider>
        </SymposiumProvider>
      </QueryProvider>
    </StoreProvider>
  );
}
