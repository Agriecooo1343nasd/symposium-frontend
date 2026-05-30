"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadStore } from "@/lib/store";
import { SPONSORS, EXHIBITORS } from "@/lib/mock-data";

export default function Exhibitors() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const store = mounted ? loadStore() : null;
  const sponsors =
    store?.approvedOrganizations.filter((o) => o.participation === "sponsor" || o.participation === "both") ?? [];
  const exhibitorsList =
    store?.approvedOrganizations.filter((o) => o.participation === "exhibitor" || o.participation === "both") ?? [];

  const sponsorCards =
    sponsors.length > 0
      ? sponsors.map((s) => ({
          id: s.id,
          name: s.name,
          blurb: s.description,
          tier: s.sponsorshipTier ?? "Silver",
        }))
      : SPONSORS.map((s) => ({ id: s.id, name: s.name, blurb: s.blurb, tier: s.tier }));

  const exhibitorCards =
    exhibitorsList.length > 0
      ? exhibitorsList.map((e) => ({
          id: e.id,
          name: e.name,
          blurb: e.description,
          booth: e.booth,
          category: e.category,
        }))
      : EXHIBITORS.map((e) => ({
          id: e.id,
          name: e.name,
          blurb: e.description,
          booth: e.booth,
          category: e.category,
        }));

  const tierColor = (t: string) =>
    t === "Platinum" ? "bg-slate-200 text-slate-900" : t === "Gold" ? "bg-amber-100 text-amber-900" : "bg-zinc-200 text-zinc-900";

  return (
    <>
      <section className="relative gradient-navy grain-overlay text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="/assets/banner-exhibitors.jpg" alt="" className="h-full w-full object-cover opacity-25" />
        </div>
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            Backed by <span className="text-gradient-light">Africa&apos;s leading institutions.</span>
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl">
            Our partners make NAS 2026 possible. Organizations can exhibit, sponsor, or both.
          </p>
          <Button asChild className="mt-8 bg-gold hover:bg-gold/90 text-navy font-semibold">
            <Link href="/register">
              Apply to exhibit <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif text-3xl font-bold mb-2">Sponsors</h2>
        <p className="text-muted-foreground mb-8">Financial and material supporters with platform-wide visibility.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
          {sponsorCards.map((s) => (
            <div key={s.id} className="rounded-2xl bg-card border border-border p-6 hover-lift flex flex-col">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full w-fit mb-2 ${tierColor(s.tier)}`}>
                {s.tier}
              </span>
              <div className="h-14 w-14 rounded-xl gradient-navy text-white flex items-center justify-center font-serif font-bold text-lg mb-3">
                {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <h3 className="font-serif font-bold text-lg">{s.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex-1">{s.blurb}</p>
            </div>
          ))}
        </div>

        <h2 className="font-serif text-3xl font-bold mb-2 flex items-center gap-2">
          <Store className="h-7 w-7" /> Exhibitors
        </h2>
        <p className="text-muted-foreground mb-8">Organizations showcasing products and innovations on the exhibition floor.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {exhibitorCards.map((e) => (
            <div key={e.id} className="rounded-2xl bg-card border border-border p-6 hover-lift flex flex-col">
              <div className="h-14 w-14 rounded-xl gradient-navy text-white flex items-center justify-center font-serif font-bold text-lg mb-3">
                {e.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <h3 className="font-serif font-bold text-lg">{e.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {e.category} · Booth {e.booth}
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-3 flex-1">{e.blurb}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
