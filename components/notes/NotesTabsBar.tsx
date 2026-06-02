"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortalNotesDocument } from "@/lib/portal-notes-document";
import { cn } from "@/lib/utils";

type Props = {
  document: PortalNotesDocument;
  onSelectTab: (tabId: string) => void;
  onAddTab: () => void;
  onRemoveTab: (tabId: string) => void;
  onRenameTab: (tabId: string, name: string) => void;
};

export function NotesTabsBar({ document, onSelectTab, onAddTab, onRemoveTab, onRenameTab }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-border bg-secondary/20 px-2 py-1.5 shrink-0 overflow-x-auto">
      {document.tabs.map((tab) => {
        const active = tab.id === document.activeTabId;
        return (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center rounded-lg border shrink-0 transition-colors",
              active ? "border-accent bg-card shadow-sm" : "border-transparent hover:bg-card/80",
            )}
          >
            {active ? (
              <Input
                className="h-7 w-[110px] text-xs border-0 bg-transparent focus-visible:ring-1 px-2"
                value={tab.name}
                onChange={(e) => onRenameTab(tab.id, e.target.value)}
                aria-label="Tab name"
              />
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground max-w-[120px] truncate"
                title={tab.name}
              >
                {tab.name}
              </button>
            )}
            {document.tabs.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveTab(tab.id)}
                className="p-1 mr-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${tab.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onAddTab} title="New session tab">
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
