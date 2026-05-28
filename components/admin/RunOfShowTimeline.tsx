import { ChevronDown, ChevronUp, Trash2, Radio, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { deleteRunOfShowItem, reorderRunOfShow, setRunOfShowStatus } from "@/lib/programme-sync";
import type { RunOfShowItem } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  day: 1 | 2;
  onEdit?: (item: RunOfShowItem) => void;
  showGoLive?: boolean;
};

export function RunOfShowTimeline({ day, onEdit, showGoLive = true }: Props) {
  const store = useStore();
  const items = store.runOfShow
    .filter((r) => r.day === day)
    .sort((a, b) => a.order - b.order);

  const move = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const ids = [...items];
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    reorderRunOfShow(day, ids.map((i) => i.id));
  };

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items scheduled for this day.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-md border p-4 flex flex-wrap gap-3 items-start justify-between",
            item.status === "live" && "border-red-400 bg-red-50/50",
            item.status === "done" && "opacity-60",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">{item.type}</span>
              <span className="text-xs text-muted-foreground">{item.startTime}–{item.endTime}</span>
              {item.status === "live" && (
                <span className="text-[10px] uppercase font-bold text-red-600 animate-pulse">Live</span>
              )}
            </div>
            <div className="font-medium">{item.title}</div>
            {item.ownerName && <div className="text-xs text-muted-foreground">Owner: {item.ownerName}</div>}
            {item.notes && <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>}
          </div>
          <div className="flex flex-wrap gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(item.id, -1)}><ChevronUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(item.id, 1)}><ChevronDown className="h-4 w-4" /></Button>
            {onEdit && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" /></Button>
            )}
            {showGoLive && item.status !== "done" && (
              <Button
                size="sm"
                variant={item.status === "live" ? "default" : "outline"}
                className={item.status === "live" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                onClick={() => setRunOfShowStatus(item.id, item.status === "live" ? "upcoming" : "live")}
              >
                <Radio className="h-3.5 w-3.5 mr-1" /> {item.status === "live" ? "End" : "Go live"}
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteRunOfShowItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}
