"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Save, Info, MonitorPlay, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type Booth, type BoothStatus } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";

// ─── Types ────────────────────────────────────────────────────────────────────

type BoothDraft = Omit<Booth, "id" | "assignedOrgId">;

const DEFAULT_INCLUDES = [
    "1× rectangular display table (180×60cm)",
    "2× chairs",
    "2× 220V power outlets",
    "Dedicated 50 Mbps wifi",
    "Booth signage with your logo",
    "Daily cleaning service",
];

const emptyDraft = (): BoothDraft => ({
    code: "",
    row: 0,
    col: 0,
    capacity: 4,
    location: "Main exhibition hall",
    status: "available",
    dimensions: "3m × 3m",
    floor: "Ground floor",
    includes: [...DEFAULT_INCLUDES],
    setupWindow: "12 Aug · 14:00–18:00",
    breakdownWindow: "14 Aug · 18:00–20:00",
    onSiteContact: "Thierry Niyonsenga · +250 788 000 000",
    notes: "",
});

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusClass = (s: BoothStatus) =>
    s === "occupied" ? "border-accent bg-accent/15 text-accent" :
        s === "reserved" ? "border-amber-300 bg-amber-50 text-amber-900" :
            "border-border bg-card text-foreground";

const statusDot = (s: BoothStatus) =>
    s === "occupied" ? "bg-accent" :
        s === "reserved" ? "bg-amber-400" :
            "bg-green";

// ─── Edit dialog ──────────────────────────────────────────────────────────────

function BoothDialog({
    open,
    onOpenChange,
    draft,
    setDraft,
    onSave,
    isEdit,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    draft: BoothDraft;
    setDraft: (d: BoothDraft) => void;
    onSave: () => void;
    isEdit: boolean;
}) {
    const [includeInput, setIncludeInput] = useState("");

    const addInclude = () => {
        const v = includeInput.trim();
        if (!v) return;
        setDraft({ ...draft, includes: [...(draft.includes ?? []), v] });
        setIncludeInput("");
    };

    const removeInclude = (i: number) => {
        setDraft({ ...draft, includes: (draft.includes ?? []).filter((_, idx) => idx !== i) });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-serif">{isEdit ? "Edit booth" : "Create booth"}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="identity">
                    <TabsList className="mb-4">
                        <TabsTrigger value="identity">Identity</TabsTrigger>
                        <TabsTrigger value="logistics">Logistics</TabsTrigger>
                        <TabsTrigger value="includes">What&apos;s included</TabsTrigger>
                    </TabsList>

                    {/* ── Identity ── */}
                    <TabsContent value="identity" className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Booth code *</Label>
                                <Input
                                    value={draft.code}
                                    onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                                    placeholder="A-01"
                                    className="mt-1 font-mono"
                                />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={draft.status}
                                    onValueChange={(v) => setDraft({ ...draft, status: v as BoothStatus })}
                                >
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="reserved">Reserved</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Dimensions</Label>
                                <Input
                                    value={draft.dimensions ?? ""}
                                    onChange={(e) => setDraft({ ...draft, dimensions: e.target.value })}
                                    placeholder="3m × 3m"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Capacity (people)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={draft.capacity}
                                    onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) || 1 })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Floor</Label>
                                <Input
                                    value={draft.floor ?? ""}
                                    onChange={(e) => setDraft({ ...draft, floor: e.target.value })}
                                    placeholder="Ground floor"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Zone / location</Label>
                                <Input
                                    value={draft.location}
                                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                                    placeholder="Main exhibition hall · near entrance"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Grid row (0-based)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={draft.row}
                                    onChange={(e) => setDraft({ ...draft, row: Number(e.target.value) || 0 })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Grid column (0-based)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={draft.col}
                                    onChange={(e) => setDraft({ ...draft, col: Number(e.target.value) || 0 })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── Logistics ── */}
                    <TabsContent value="logistics" className="space-y-4">
                        <div>
                            <Label>Setup window</Label>
                            <Input
                                value={draft.setupWindow ?? ""}
                                onChange={(e) => setDraft({ ...draft, setupWindow: e.target.value })}
                                placeholder="12 Aug · 14:00–18:00"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Breakdown window</Label>
                            <Input
                                value={draft.breakdownWindow ?? ""}
                                onChange={(e) => setDraft({ ...draft, breakdownWindow: e.target.value })}
                                placeholder="14 Aug · 18:00–20:00"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>On-site contact</Label>
                            <Input
                                value={draft.onSiteContact ?? ""}
                                onChange={(e) => setDraft({ ...draft, onSiteContact: e.target.value })}
                                placeholder="Name · +250 7XX XXX XXX"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Internal notes</Label>
                            <Textarea
                                rows={3}
                                value={draft.notes ?? ""}
                                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                                placeholder="Power needs, special requests, accessibility notes…"
                                className="mt-1"
                            />
                        </div>
                    </TabsContent>

                    {/* ── What's included ── */}
                    <TabsContent value="includes" className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            These items are shown to the exhibitor on their Booth info page.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                value={includeInput}
                                onChange={(e) => setIncludeInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclude())}
                                placeholder="Add item…"
                                className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={addInclude}>Add</Button>
                        </div>
                        <ul className="space-y-1.5">
                            {(draft.includes ?? []).map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm rounded-lg bg-secondary/50 px-3 py-2">
                                    <span className="flex-1">{item}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeInclude(i)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                            {(draft.includes ?? []).length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No items — add above.</p>
                            )}
                        </ul>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onSave} className="gradient-blue text-accent-foreground">
                        <Save className="h-3.5 w-3.5 mr-1" /> Save booth
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Drag-and-drop grid map ───────────────────────────────────────────────────

function BoothGrid({
    booths,
    onEdit,
    onRemove,
}: {
    booths: Booth[];
    onEdit: (b: Booth) => void;
    onRemove: (id: string) => void;
}) {
    const store = useStore();
    // Track pending swaps before the user saves
    const [swapped, setSwapped] = useState<Record<string, { row: number; col: number }>>({});
    const dragId = useRef<string | null>(null);

    // Compute display positions (swaps override stored row/col)
    const displayBooths = booths.map((b) => ({
        ...b,
        row: swapped[b.id]?.row ?? b.row,
        col: swapped[b.id]?.col ?? b.col,
    }));

    const rows = Math.max(...displayBooths.map((b) => b.row)) + 1;
    const cols = Math.max(...displayBooths.map((b) => b.col)) + 1;

    const atCell = (r: number, c: number) => displayBooths.find((b) => b.row === r && b.col === c);

    const onDragStart = (id: string) => { dragId.current = id; };

    const onDrop = (targetRow: number, targetCol: number) => {
        const fromId = dragId.current;
        if (!fromId) return;
        const fromBooth = displayBooths.find((b) => b.id === fromId);
        if (!fromBooth) return;

        const toBooth = atCell(targetRow, targetCol);

        setSwapped((prev) => {
            const next = { ...prev };
            // Move dragged booth to target cell
            next[fromId] = { row: targetRow, col: targetCol };
            // Swap: move target booth (if any) to where dragged booth was
            if (toBooth && toBooth.id !== fromId) {
                next[toBooth.id] = { row: fromBooth.row, col: fromBooth.col };
            }
            return next;
        });
        dragId.current = null;
    };

    const hasPendingSwaps = Object.keys(swapped).length > 0;

    const saveSwaps = () => {
        patchStore((s) => ({
            ...s,
            booths: s.booths.map((b) =>
                swapped[b.id] ? { ...b, row: swapped[b.id].row, col: swapped[b.id].col } : b,
            ),
        }));
        setSwapped({});
        toast.success("Booth positions saved");
    };

    const discardSwaps = () => {
        setSwapped({});
        toast.info("Changes discarded");
    };

    return (
        <div className="space-y-4">
            {/* Legend + save bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {[
                        { color: "bg-accent", label: "Occupied" },
                        { color: "bg-amber-400", label: "Reserved" },
                        { color: "bg-green", label: "Available" },
                    ].map((l) => (
                        <span key={l.label} className="flex items-center gap-1.5">
                            <span className={cn("h-2.5 w-2.5 rounded-full", l.color)} />
                            {l.label}
                        </span>
                    ))}
                </div>
                {hasPendingSwaps && (
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={discardSwaps}>Discard</Button>
                        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={saveSwaps}>
                            <Save className="h-3.5 w-3.5 mr-1" /> Save positions
                        </Button>
                    </div>
                )}
            </div>

            {/* Stage / entrance indicators */}
            <div className="rounded-2xl border border-border bg-card overflow-auto p-4">
                {/* Stage bar at top */}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-navy/10 border border-navy/20 py-3 mb-4 text-sm font-semibold text-foreground">
                    <MonitorPlay className="h-4 w-4 text-accent" />
                    STAGE / MAIN SCREEN — Grand Ballroom entrance (North)
                </div>

                {/* Grid */}
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(88px, 1fr))` }}
                >
                    {Array.from({ length: rows }, (_, r) =>
                        Array.from({ length: cols }, (_, c) => {
                            const booth = atCell(r, c);
                            const isPending = booth && swapped[booth.id];
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => onDrop(r, c)}
                                    className={cn(
                                        "rounded-lg border-2 border-dashed min-h-[80px] flex flex-col transition-colors",
                                        booth ? "border-transparent" : "border-border/40 bg-secondary/20",
                                        isPending && "ring-2 ring-amber-400",
                                    )}
                                >
                                    {booth ? (
                                        <div
                                            draggable
                                            onDragStart={() => onDragStart(booth.id)}
                                            className={cn(
                                                "rounded-lg border-2 p-2 text-center text-xs min-h-[80px] flex flex-col justify-between cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-md",
                                                statusClass(booth.status),
                                                isPending && "ring-2 ring-amber-400 ring-offset-1",
                                            )}
                                        >
                                            <div>
                                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                                    <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", statusDot(booth.status))} />
                                                    <span className="font-bold font-mono">{booth.code}</span>
                                                </div>
                                                {booth.dimensions && (
                                                    <div className="text-[9px] text-muted-foreground">{booth.dimensions}</div>
                                                )}
                                                {(() => {
                                                    const org = store.approvedOrganizations.find((o) => o.booth === booth.code);
                                                    return org ? (
                                                        <div className="truncate text-[9px] mt-0.5 font-medium text-accent">{org.name}</div>
                                                    ) : null;
                                                })()}
                                            </div>
                                            <div className="flex justify-center gap-0.5 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(booth)}
                                                    className="rounded p-1 hover:bg-black/10 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-2.5 w-2.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onRemove(booth.id)}
                                                    className="rounded p-1 hover:bg-red-100 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-2.5 w-2.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-[9px] text-muted-foreground/50 font-mono">
                                            R{r} C{c}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Entrance indicator at bottom */}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-green/10 border border-green/20 py-3 mt-4 text-sm font-semibold text-foreground">
                    <DoorOpen className="h-4 w-4 text-green" />
                    MAIN ENTRANCE — Exhibition Hall (South)
                </div>
            </div>

            {hasPendingSwaps && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {Object.keys(swapped).length} booth position{Object.keys(swapped).length > 1 ? "s" : ""} changed. Click &quot;Save positions&quot; to apply or &quot;Discard&quot; to undo.
                </p>
            )}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BoothMapManager() {
    const store = useStore();
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<BoothDraft>(emptyDraft());

    const openCreate = () => {
        setEditingId(null);
        setDraft(emptyDraft());
        setOpen(true);
    };

    useAdminCommandAction({
        "new-booth": openCreate,
    });

    const openEdit = (b: Booth) => {
        setEditingId(b.id);
        setDraft({
            code: b.code,
            row: b.row,
            col: b.col,
            capacity: b.capacity,
            location: b.location || "",
            status: b.status,
            dimensions: b.dimensions ?? "3m × 3m",
            floor: b.floor ?? "Ground floor",
            includes: b.includes ?? [...DEFAULT_INCLUDES],
            setupWindow: b.setupWindow ?? "12 Aug · 14:00–18:00",
            breakdownWindow: b.breakdownWindow ?? "14 Aug · 18:00–20:00",
            onSiteContact: b.onSiteContact ?? "",
            notes: b.notes ?? "",
        });
        setOpen(true);
    };

    const save = () => {
        if (!draft.code.trim()) return toast.error("Booth code required");
        if (editingId) {
            patchStore((s) => ({
                ...s,
                booths: s.booths.map((b) =>
                    b.id === editingId ? { ...b, ...draft, code: draft.code.trim() } : b,
                ),
            }));
            toast.success("Booth updated");
        } else {
            patchStore((s) => ({
                ...s,
                booths: [
                    ...s.booths,
                    { id: uid("booth"), ...draft, code: draft.code.trim() },
                ],
            }));
            toast.success("Booth created");
        }
        setOpen(false);
    };

    const remove = (id: string) => {
        const b = store.booths.find((x) => x.id === id);
        if (b?.status === "occupied") return toast.error("Cannot delete an occupied booth");
        patchStore((s) => ({ ...s, booths: s.booths.filter((x) => x.id !== id) }));
        toast.info("Booth removed");
    };

    const sorted = [...store.booths].sort((a, b) => a.row - b.row || a.col - b.col);
    const occupied = sorted.filter((b) => b.status === "occupied").length;
    const reserved = sorted.filter((b) => b.status === "reserved").length;

    return (
        <div className="space-y-6">
            {/* Header stats */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5" />
                        {sorted.length} total · {occupied} occupied · {reserved} reserved · {sorted.length - occupied - reserved} available
                    </span>
                </div>
                <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-1" /> New booth
                </Button>
            </div>

            {/* Drag-and-drop map */}
            <BoothGrid booths={sorted} onEdit={openEdit} onRemove={remove} />

            {/* Detail table */}
            <div className="rounded-xl border overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="text-left px-4 py-3">Code</th>
                            <th className="text-left px-4 py-3">Dimensions</th>
                            <th className="text-left px-4 py-3">Floor</th>
                            <th className="text-left px-4 py-3">Zone</th>
                            <th className="text-left px-4 py-3">Setup</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Assigned to</th>
                            <th className="text-right px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((b) => {
                            const org = store.approvedOrganizations.find((o) => o.booth === b.code);
                            return (
                                <tr key={b.id} className="border-t hover:bg-secondary/20 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold">{b.code}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{b.dimensions ?? "—"}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{b.floor ?? "—"}</td>
                                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{b.location || "—"}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{b.setupWindow ?? "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                                            b.status === "occupied" ? "bg-accent/15 text-accent" :
                                                b.status === "reserved" ? "bg-amber-100 text-amber-800" :
                                                    "bg-green/15 text-green",
                                        )}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-medium text-accent">{org?.name ?? "—"}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <BoothDialog
                open={open}
                onOpenChange={setOpen}
                draft={draft}
                setDraft={setDraft}
                onSave={save}
                isEdit={!!editingId}
            />
        </div>
    );
}
