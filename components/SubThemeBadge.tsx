import { cn } from "@/lib/utils";
import { SUB_THEME_COLORS, type SubTheme } from "@/lib/mock-data";

export function SubThemeBadge({ theme, className }: { theme: SubTheme; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        SUB_THEME_COLORS[theme],
        className
      )}
    >
      {theme}
    </span>
  );
}
