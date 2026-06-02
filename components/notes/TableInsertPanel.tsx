"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (rows: number, cols: number, withHeaderRow: boolean) => void;
};

export function TableInsertPanel({ open, onOpenChange, onInsert }: Props) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);

  useEffect(() => {
    if (open) {
      setRows(3);
      setCols(3);
      setHeader(true);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const r = Math.min(20, Math.max(1, rows));
    const c = Math.min(10, Math.max(1, cols));
    onInsert(r, c, header);
    onOpenChange(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Insert table"
      className="shrink-0 border-b border-border bg-card px-3 py-3"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-sm font-semibold">Insert table</p>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="tbl-rows" className="text-xs">
            Rows
          </Label>
          <Input
            id="tbl-rows"
            type="number"
            min={1}
            max={20}
            className="h-8 mt-1"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="tbl-cols" className="text-xs">
            Columns
          </Label>
          <Input
            id="tbl-cols"
            type="number"
            min={1}
            max={10}
            className="h-8 mt-1"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
          />
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs cursor-pointer">
        <Checkbox checked={header} onCheckedChange={(v) => setHeader(v === true)} />
        Header row
      </label>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="button" size="sm" className="h-8" onClick={submit}>
          Insert
        </Button>
      </div>
    </div>
  );
}
