"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SYMPOSIUM_SLUG } from "@/lib/api/constants";
import type { SymposiumDto } from "@/lib/api/dto";
import { useSymposium } from "@/hooks/api/useSymposium";

type SymposiumContextValue = {
  slug: string;
  symposiumId: string | null;
  symposium: SymposiumDto | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const SymposiumContext = createContext<SymposiumContextValue | null>(null);

export function SymposiumProvider({
  children,
  slug = DEFAULT_SYMPOSIUM_SLUG,
}: {
  children: React.ReactNode;
  slug?: string;
}) {
  const { symposiumId, symposium, isLoading, isError, error } = useSymposium(slug);

  return (
    <SymposiumContext.Provider
      value={{
        slug,
        symposiumId,
        symposium,
        isLoading,
        isError,
        error: error ?? null,
      }}
    >
      {children}
    </SymposiumContext.Provider>
  );
}

export function useSymposiumContext() {
  const ctx = useContext(SymposiumContext);
  if (!ctx) {
    throw new Error("useSymposiumContext must be used within SymposiumProvider");
  }
  return ctx;
}

export function useOptionalSymposiumContext() {
  return useContext(SymposiumContext);
}
