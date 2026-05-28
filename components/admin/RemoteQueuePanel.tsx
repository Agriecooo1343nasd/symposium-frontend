import { Check, X, Pin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { patchStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RemoteQueuePanel() {
  const store = useStore();

  const updateStatus = (id: string, status: "approved" | "answered" | "dismissed", pinned?: boolean) => {
    patchStore((s) => ({
      ...s,
      remoteInteractions: s.remoteInteractions.map((i) =>
        i.id === id ? { ...i, status, ...(pinned !== undefined ? { pinned } : {}) } : i,
      ),
    }));
    toast.success("Updated");
  };

  const pending = store.remoteInteractions.filter((i) => i.status === "pending");

  return (
    <div className="space-y-3">
      {pending.length === 0 && <p className="text-sm text-muted-foreground">Queue empty.</p>}
      {pending.map((item) => (
        <div key={item.id} className="rounded-md border border-border bg-card p-4 flex gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">{item.type}</span>
            <div className="font-semibold text-sm">{item.author}</div>
            <p className="text-sm mt-1">{item.message}</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button size="sm" className="gradient-blue text-accent-foreground h-8" onClick={() => updateStatus(item.id, "approved")}><Check className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" h-8 onClick={() => updateStatus(item.id, "dismissed")}><X className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      ))}
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">On screen</h4>
        {store.remoteInteractions.filter((i) => i.status === "approved").map((i) => (
          <div key={i.id} className={cn("text-sm border-l-2 border-accent pl-2 mb-2")}>
            <strong>{i.author}</strong>: {i.message}
          </div>
        ))}
      </div>
    </div>
  );
}
