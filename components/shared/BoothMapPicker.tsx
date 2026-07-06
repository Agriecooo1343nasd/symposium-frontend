"use client";

import { MonitorPlay, DoorOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PickerBooth = {
    id: string;
    code: string;
    row: number;
    col: number;
    status: "available" | "reserved" | "occupied";
    dimensions?: string | null;
};

type Booth = PickerBooth;

/**
 * Read-only booth map with three modes:
 *
 * "view"   — highlights the viewer's own booth (myBoothCode), shows all others
 *            as occupied/reserved/available. No selection.
 *
 * "pick"   — applicant picks a preferred booth. occupied/reserved are shown but
 *            unclickable. Available booths are clickable; selected is highlighted.
 *
 * Both modes show the stage (North) and entrance (South) markers.
 */

type Mode = "view" | "pick";

interface Props {
    booths: Booth[];
    mode: Mode;
    /** "view": highlights this code as YOUR booth */
    myBoothCode?: string;
    /** "pick": currently selected booth id */
    selectedId?: string;
    /** "pick": called when user clicks an available booth */
    onSelect?: (booth: Booth) => void;
}

export function BoothMapPicker({ booths, mode, myBoothCode, selectedId, onSelect }: Props) {
    if (booths.length === 0) return null;

    const rows = Math.max(...booths.map((b) => b.row)) + 1;
    const cols = Math.max(...booths.map((b) => b.col)) + 1;

    const atCell = (r: number, c: number) =>
        booths.find((b) => b.row === r && b.col === c);

    const cellClass = (b: Booth) => {
        const isMyBooth = mode === "view" && b.code === myBoothCode;
        const isSelected = mode === "pick" && b.id === selectedId;
        const unavailable = b.status === "occupied" || b.status === "reserved";

        if (isMyBooth) return "border-gold bg-gold/20 ring-2 ring-gold cursor-default";
        if (isSelected) return "border-accent bg-accent/20 ring-2 ring-accent cursor-pointer";
        if (unavailable) return "border-border bg-secondary/60 opacity-60 cursor-not-allowed";
        if (mode === "pick") return "border-green/50 bg-green/5 hover:bg-green/15 hover:border-green cursor-pointer";
        // view mode — normal available
        return "border-border bg-card";
    };

    const handleClick = (b: Booth) => {
        if (mode !== "pick") return;
        if (b.status === "occupied" || b.status === "reserved") return;
        onSelect?.(b);
    };

    return (
        <div className="space-y-3">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {mode === "view" && (
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-gold ring-1 ring-gold" /> Your booth
                    </span>
                )}
                {mode === "pick" && (
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-accent ring-1 ring-accent" /> Selected
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-secondary border border-border opacity-60" /> Occupied / reserved
                </span>
                {mode === "pick" && (
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-green/20 border border-green/50" /> Available — click to select
                    </span>
                )}
                {mode === "view" && (
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-card border border-border" /> Available
                    </span>
                )}
            </div>

            {/* Map */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 overflow-auto">
                {/* Stage */}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-navy/10 border border-navy/20 py-2.5 mb-3 text-xs font-semibold text-foreground">
                    <MonitorPlay className="h-3.5 w-3.5 text-accent" />
                    STAGE / MAIN SCREEN — Grand Ballroom (North)
                </div>

                {/* Grid */}
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(72px, 1fr))` }}
                >
                    {Array.from({ length: rows }, (_, r) =>
                        Array.from({ length: cols }, (_, c) => {
                            const booth = atCell(r, c);
                            const isMyBooth = mode === "view" && booth?.code === myBoothCode;
                            const isSelected = mode === "pick" && booth?.id === selectedId;

                            if (!booth) {
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className="rounded-lg border-2 border-dashed border-border/20 min-h-[64px]"
                                    />
                                );
                            }

                            return (
                                <div
                                    key={booth.id}
                                    onClick={() => handleClick(booth)}
                                    title={
                                        booth.status !== "available"
                                            ? `${booth.code} — ${booth.status}`
                                            : mode === "pick"
                                                ? `${booth.code} · ${booth.dimensions ?? "3m×3m"} · click to select`
                                                : booth.code
                                    }
                                    className={cn(
                                        "rounded-lg border-2 p-2 text-center text-xs min-h-[64px] flex flex-col justify-between select-none transition-all",
                                        cellClass(booth),
                                    )}
                                >
                                    <div>
                                        <div className="font-bold font-mono text-sm leading-tight">{booth.code}</div>
                                        {booth.dimensions && (
                                            <div className="text-[9px] text-muted-foreground mt-0.5">{booth.dimensions}</div>
                                        )}
                                        {isMyBooth && (
                                            <div className="text-[9px] font-bold text-amber-700 mt-0.5">YOUR BOOTH</div>
                                        )}
                                        {isSelected && (
                                            <div className="text-[9px] font-bold text-accent mt-0.5 flex items-center justify-center gap-0.5">
                                                <CheckCircle2 className="h-2.5 w-2.5" /> Selected
                                            </div>
                                        )}
                                        {booth.status === "occupied" && (
                                            <div className="text-[9px] text-muted-foreground mt-0.5">Taken</div>
                                        )}
                                        {booth.status === "reserved" && (
                                            <div className="text-[9px] text-amber-700 mt-0.5">Reserved</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Entrance */}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-green/10 border border-green/20 py-2.5 mt-3 text-xs font-semibold text-foreground">
                    <DoorOpen className="h-3.5 w-3.5 text-green" />
                    MAIN ENTRANCE — Exhibition Hall (South)
                </div>
            </div>
        </div>
    );
}
