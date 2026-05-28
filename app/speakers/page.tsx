"use client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SpeakerCard } from "@/components/SpeakerCard";
import { SPEAKERS, SUB_THEMES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Speakers() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  const list = useMemo(() => {
    return SPEAKERS.filter((s) => {
      const matchQ = !q || [s.name, s.org, s.country].some((f) => f.toLowerCase().includes(q.toLowerCase()));
      return matchQ;
    });
  }, [q, filter]);

  const featured = SPEAKERS.filter((s) => s.featured);

  return (
    <>
      <section className="gradient-navy grain-overlay text-white py-16 sm:py-20">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            The voices shaping <span className="text-gradient-light">Africa&apos;s agroecology agenda.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-6">Featured keynote speakers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featured.map((s) => <SpeakerCard key={s.id} speaker={s} />)}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pt-6 border-t border-border">
          <h2 className="font-serif text-2xl font-bold">All speakers</h2>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or organization" className="pl-9" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {(["All", ...SUB_THEMES] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium border", filter === t ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {list.map((s) => <SpeakerCard key={s.id} speaker={s} />)}
          {list.length === 0 && <div className="col-span-full text-center py-16 text-muted-foreground">No speakers match your search.</div>}
        </div>
      </section>
    </>
  );
}
