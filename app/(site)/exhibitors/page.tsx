"use client";

import { usePublicExhibitors, usePublicSponsors } from "@/hooks/api/usePublicData";
import Link from "next/link";
import { ArrowRight, Store, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Exhibitors() {
  const { data: sponsors, isLoading: sponsorsLoading } = usePublicSponsors();
  const { exhibitors, isLoading: exhibitorsLoading } = usePublicExhibitors();

  const sponsorCards = (sponsors ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    blurb: s.description ?? "",
    tier: s.tier ? s.tier.charAt(0).toUpperCase() + s.tier.slice(1) : "Silver",
    logoUrl: s.logoUrl,
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
          <div className="flex flex-wrap gap-3 mt-8">
            <Button asChild className="bg-gold hover:bg-gold/90 text-navy font-semibold">
              <Link href="/dashboard/apply-exhibit">
                Apply to exhibit <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
              <Link href="/dashboard/apply-exhibit">
                Become a sponsor
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif text-3xl font-bold mb-2">Sponsors</h2>
        <p className="text-muted-foreground mb-8">Financial and material supporters with platform-wide visibility.</p>
        {sponsorsLoading ? (
          <p className="text-muted-foreground text-sm mb-16">Loading sponsors…</p>
        ) : sponsorCards.length === 0 ? (
          <p className="text-muted-foreground text-sm mb-16 border border-dashed rounded-2xl p-8 text-center">
            Sponsor profiles will appear here once the secretariat approves applications.
          </p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
          {sponsorCards.map((s) => (
            <div key={s.id} className="rounded-2xl bg-card border border-border p-6 hover-lift flex flex-col">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full w-fit mb-2 ${tierColor(s.tier)}`}>
                {s.tier}
              </span>
              {s.logoUrl ? (
                <img src={s.logoUrl} alt={s.name} className="h-14 w-auto max-w-full object-contain mb-3" />
              ) : (
                <div className="h-14 w-14 rounded-xl gradient-navy text-white flex items-center justify-center font-serif font-bold text-lg mb-3">
                  {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
              )}
              <h3 className="font-serif font-bold text-lg">{s.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex-1">{s.blurb}</p>
            </div>
          ))}
        </div>
        )}

        <h2 className="font-serif text-3xl font-bold mb-2 flex items-center gap-2">
          <Store className="h-7 w-7" /> Exhibitors
        </h2>
        <p className="text-muted-foreground mb-8">Organizations showcasing products and innovations on the exhibition floor.</p>
        {exhibitorsLoading ? (
          <p className="text-muted-foreground text-sm">Loading exhibitors…</p>
        ) : exhibitors.length === 0 ? (
          <p className="text-muted-foreground text-sm border border-dashed rounded-2xl p-8 text-center">
            Exhibitor booths will appear here once organizations are approved. Sponsors are listed above.
          </p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {exhibitors.map((e) => (
            <div key={e.id} className="rounded-2xl bg-card border border-border p-6 hover-lift flex flex-col">
              <div className="h-14 w-14 rounded-xl gradient-navy text-white flex items-center justify-center font-serif font-bold text-lg mb-3">
                {(e.companyName ?? "Exhibitor").split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <h3 className="font-serif font-bold text-lg">{e.companyName ?? "Exhibitor"}</h3>
              {e.boothNumber && (
                <p className="text-xs text-muted-foreground capitalize">Booth {e.boothNumber}</p>
              )}
            </div>
          ))}
        </div>
        )}
      </section>

      {/* FR-1.5 — Become a Sponsor CTA */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
     
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Partner with NAS 2026
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
            Join Platinum, Gold, or Silver sponsors reaching 300+ policymakers, researchers, farmers, and development partners. Sponsorship includes homepage logo placement, newsletter features, staff passes, and speaking opportunities.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-navy font-semibold">
              <Link href="/dashboard/apply-exhibit">
                Become a sponsor
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Talk to the team</Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-12 text-left">
            {[
              { tier: "Platinum", fee: "From $15,000", perks: ["Homepage carousel · top tier", "5 brochure uploads", "10 staff passes", "Lead capture", "Speaking slot"] },
              { tier: "Gold", fee: "From $8,000", perks: ["Homepage carousel · mid tier", "3 brochure uploads", "6 staff passes", "Lead capture", "Newsletter feature"] },
              { tier: "Silver", fee: "From $3,000", perks: ["Exhibitors page logo", "1 brochure upload", "3 staff passes", "Standard listing"] },
            ].map((t) => (
              <div key={t.tier} className={`rounded-2xl border p-5 bg-card ${t.tier === "Gold" ? "border-accent shadow-md ring-1 ring-accent/20" : "border-border"}`}>
                <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full w-fit mb-3 ${t.tier === "Platinum" ? "bg-slate-200 text-slate-900" : t.tier === "Gold" ? "bg-amber-100 text-amber-900" : "bg-zinc-200 text-zinc-900"}`}>
                  {t.tier}
                </div>
                <div className="font-serif text-xl font-bold mb-1">{t.tier}</div>
                <div className="text-sm text-accent font-semibold mb-3">{t.fee}</div>
                <ul className="space-y-1.5 text-sm">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
