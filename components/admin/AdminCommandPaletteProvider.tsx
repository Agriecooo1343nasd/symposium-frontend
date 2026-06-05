"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ADMIN_COMMANDS,
  buildCommandHref,
  filterAdminCommands,
  groupAdminCommands,
  type AdminCommand,
} from "@/lib/admin-command-registry";

type AdminCommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AdminCommandPaletteContext = createContext<AdminCommandPaletteContextValue | null>(null);

export function useAdminCommandPalette() {
  const ctx = useContext(AdminCommandPaletteContext);
  if (!ctx) throw new Error("useAdminCommandPalette must be used within AdminCommandPaletteProvider");
  return ctx;
}

export function useAdminCommandPaletteOptional() {
  return useContext(AdminCommandPaletteContext);
}

export function AdminCommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = useCallback(
    (cmd: AdminCommand) => {
      router.push(buildCommandHref(cmd));
      setOpen(false);
      setQuery("");
    },
    [router],
  );

  const filtered = useMemo(() => filterAdminCommands(query), [query]);
  const grouped = useMemo(() => groupAdminCommands(filtered), [filtered]);

  const groupOrder = ["Add & create", "Pages", "Tabs & sections"];
  const sortedGroups = [...grouped.keys()].sort((a, b) => {
    const ai = groupOrder.indexOf(a);
    const bi = groupOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const ctx = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <AdminCommandPaletteContext.Provider value={ctx}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search pages, tabs, add actions…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[min(420px,60vh)]">
          <CommandEmpty>No matching commands. Try &quot;add&quot;, &quot;sponsor&quot;, or &quot;finance&quot;.</CommandEmpty>
          {sortedGroups.map((group) => (
            <CommandGroup key={group} heading={group}>
              {(grouped.get(group) ?? []).map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  value={`${cmd.label} ${cmd.description ?? ""} ${cmd.keywords.join(" ")}`}
                  onSelect={() => run(cmd)}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate">{cmd.label}</span>
                    {cmd.description && (
                      <span className="text-xs text-muted-foreground truncate">{cmd.description}</span>
                    )}
                  </div>
                  {cmd.action && <CommandShortcut>↵</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="border-t px-3 py-2 text-[10px] text-muted-foreground flex items-center justify-between gap-2">
          <span>Type to filter · &quot;add&quot; shows all create actions</span>
          <kbd className="hidden sm:inline rounded border bg-muted px-1.5 py-0.5 font-mono">Ctrl+K</kbd>
        </div>
      </CommandDialog>
    </AdminCommandPaletteContext.Provider>
  );
}
