"use client";

import { useEffect, useState } from "react";
import { loadStore } from "@/lib/store";
import { isSponsorOrg } from "@/lib/sponsorship-records";

type Item = { id: string; name: string; tier: string };

export function SponsorMarquee() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const store = loadStore();
    const fromStore = store.approvedOrganizations
      .filter(isSponsorOrg)
      .map((o) => ({ id: o.id, name: o.name, tier: o.sponsorshipTier ?? "Silver" }));
    setItems(fromStore);
  }, []);

  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="marquee-pause overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="marquee flex gap-6 w-max">
        {loop.map((s, i) => (
          <div
            key={`${s.id}-${i}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4 min-w-[200px] shadow-sm"
          >
            <div className="h-10 w-10 rounded-lg gradient-navy flex items-center justify-center text-white font-serif font-bold text-sm flex-shrink-0">
              {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-foreground leading-tight">{s.name}</div>
              <div className="text-[10px] uppercase text-muted-foreground font-bold">{s.tier}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
