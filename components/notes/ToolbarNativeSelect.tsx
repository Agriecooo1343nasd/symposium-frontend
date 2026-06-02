"use client";

import { cn } from "@/lib/utils";

type Option = { id: string; label: string };

/** Native &lt;select&gt; — reliable inside fixed/stacked portal panels (Radix dropdowns often fail here). */
export function ToolbarNativeSelect({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (id: string) => void;
  options: readonly Option[];
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "h-8 shrink-0 cursor-pointer rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
