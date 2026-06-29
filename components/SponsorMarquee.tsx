"use client";

import { useMemo } from "react";
import { usePublicSponsors } from "@/hooks/api/usePublicData";
import type { SponsorDto } from "@/lib/api/dto";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  badge: string;
  sublabel: string;
};

const TIER_ORDER: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

function tierLabel(tier: string): string {
  if (!tier) return "Partner";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function toItems(sponsors: SponsorDto[]): Item[] {
  return [...sponsors]
    .sort((a, b) => {
      const ta = TIER_ORDER[a.tier?.toLowerCase()] ?? 4;
      const tb = TIER_ORDER[b.tier?.toLowerCase()] ?? 4;
      if (ta !== tb) return ta - tb;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
    })
    .map((s) => ({ id: s.id, name: s.name, badge: tierLabel(s.tier), sublabel: "Sponsor" }));
}

/** Repeat base set so one half of the loop fills at least ~screen width on large displays. */
function buildLoop(items: Item[]): Item[] {
  if (items.length === 0) return [];
  const minPerHalf = 8;
  const repeats = Math.max(2, Math.ceil(minPerHalf / items.length));
  const half = Array.from({ length: repeats }, () => items).flat();
  return [...half, ...half];
}

export function SponsorMarquee() {
  const { data } = usePublicSponsors();
  const items = useMemo(() => toItems(data ?? []), [data]);
  const loop = useMemo(() => buildLoop(items), [items]);

  if (loop.length === 0) return null;

  const halfCount = loop.length / 2;
  const durationSec = Math.max(24, halfCount * 5);

  return (
    <div className="relative w-full overflow-hidden py-2 sm:py-4">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-secondary/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-secondary/40 to-transparent"
        aria-hidden
      />

      <div
        className="marquee flex w-max items-stretch gap-4 sm:gap-5 px-4 sm:px-6"
        style={{ "--marquee-duration": `${durationSec}s` } as React.CSSProperties}
      >
        {loop.map((s, i) => (
          <div
            key={`${s.id}-${i}`}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:px-5 sm:py-4",
              "shadow-sm w-[200px] sm:w-[240px] md:w-[260px]",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-navy text-sm font-serif font-bold text-white sm:h-11 sm:w-11">
              {s.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-serif text-sm font-bold leading-tight text-foreground line-clamp-2">{s.name}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{s.badge}</div>
              <div className="text-[10px] text-muted-foreground/80 truncate">{s.sublabel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
